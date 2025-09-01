// ==UserScript==
// @name         OpenAI Logs Exporter (Unofficial, page-injected)
// @description  Export OpenAI Dashboard Logs via auto-scroll capture (page hook)
// @namespace    https://example.com/
// @version      0.8.0
// @match        https://platform.openai.com/logs*
// @match        https://platform.openai.com/*/logs*
// @grant        GM_addStyle
// @grant        GM_download
// @run-at       document-end
// @inject-into  page
// ==/UserScript==

(function () {
  "use strict";

  // このユーザースクリプトの目的:
  // - OpenAI プラットフォームのログ/レスポンス一覧ページ上で、ネットワーク層をページ内からフックしてデータを収集します。
  // - 取得したデータを重複排除しながら蓄積し、手動操作なしで自動スクロールにより追加分を回収します。
  // - 収集結果は JSON Lines 形式 (.jsonl) でダウンロード可能にします。

  // -----------------------------
  // Shared utils (userscript side)
  // -----------------------------
  // 非同期ウェイト用のユーティリティ。自動スクロールでの間隔調整に使用。
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // ファイル名付与用のタイムスタンプ文字列 (YYYYMMDD-HHMMSS)
  const nowStamp = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "-" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  };
  // 配列の各要素を 1 行 1 JSON として連結する JSONL 変換
  const toJSONL = (arr) => arr.map((o) => JSON.stringify(o)).join("\n");

  // 収集したアイテムを一元管理するコレクタ。
  // - id ベースで重複排除 (id がない場合は JSON シリアライズの簡易ハッシュで代替)
  // - API 応答のよくある配列構造や GraphQL エッジ形式からノードを抽出
  const makeCollector = () => {
    const byId = new Map();
    const byHash = new Set();
    const items = [];
    // オブジェクトの簡易ハッシュ。id がない場合の重複検出に利用 (衝突の可能性は低いがゼロではない)
    const hash = (obj) => {
      try {
        const s = JSON.stringify(obj);
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
        return String(h >>> 0);
      } catch {
        return String(Math.random());
      }
    };
    // 個別要素を追加。id またはハッシュで重複を抑止。
    const push = (obj) => {
      if (!obj || typeof obj !== "object") return false;
      const candId =
        obj.id ||
        (obj.response && obj.response.id) ||
        (obj.request && obj.request.id) ||
        (obj.data && obj.data.id);
      if (candId) {
        if (byId.has(candId)) return false;
        byId.set(candId, obj);
        items.push(obj);
        return true;
      } else {
        const h = hash(obj);
        if (byHash.has(h)) return false;
        byHash.add(h);
        items.push(obj);
        return true;
      }
    };
    // 配列/単一オブジェクトを問わず複数投入に対応
    const pushMany = (arrish) => {
      if (!arrish) return 0;
      let n = 0;
      if (Array.isArray(arrish)) {
        for (const x of arrish) if (push(x)) n++;
      } else if (typeof arrish === "object") {
        if (push(arrish)) n++;
      }
      return n;
    };
    // Try common shapes, and GraphQL-ish edges
    // API 応答の「よくある配列キー」や GraphQL の edges 形式からノード配列を抽出し、まとめて pushMany。
    const tryCommonArrays = (json) => {
      if (!json) return 0;
      if (Array.isArray(json)) return pushMany(json);
      if (Array.isArray(json.data)) return pushMany(json.data);
      if (Array.isArray(json.items)) return pushMany(json.items);
      if (Array.isArray(json.responses)) return pushMany(json.responses);
      if (Array.isArray(json.logs)) return pushMany(json.logs);
      if (Array.isArray(json.completions)) return pushMany(json.completions);

      // GraphQL edges: { data: { logs: { edges: [{node: {...}}], pageInfo: {...} } } }
      try {
        if (json.data) {
          for (const k of Object.keys(json.data)) {
            const v = json.data[k];
            if (v && Array.isArray(v.edges)) {
              const nodes = v.edges.map((e) => e && (e.node || e)).filter(Boolean);
              if (nodes.length) return pushMany(nodes);
            }
          }
        }
      } catch {}
      // Fallback: single object
      return pushMany(json);
    };
    return { items, pushMany, tryCommonArrays };
  };

  // -----------------------------
  // UI panel
  // -----------------------------
  // 右下に常駐する簡易 UI パネル (開始/停止/クリア、詳細ログの ON/OFF、進捗表示)
  GM_addStyle(`
    #oai-logs-exporter {
      position: fixed; right: 16px; bottom: 16px; z-index: 999999;
      background: rgba(20,22,25,.95); color: #fff; padding: 12px; width: 380px;
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.35); font-family: ui-sans-serif, system-ui, -apple-system;
    }
    #oai-logs-exporter h3 { margin: 0 0 8px; font-size: 14px; font-weight: 700; }
    #oai-logs-exporter textarea { width: 100%; min-height: 90px; font-size: 12px; }
    #oai-logs-exporter input[type="text"] { width: 100%; font-size: 12px; }
    #oai-logs-exporter label { display:flex; align-items:center; gap:6px; font-size:12px; }
    #oai-logs-exporter button {
      margin: 6px 6px 0 0; padding: 6px 10px; border: 0; border-radius: 8px; cursor: pointer;
      background: #10a37f; color: #fff; font-weight: 600;
    }
    #oai-logs-exporter button.secondary { background: #2d333b; }
    #oai-logs-exporter .muted { color: #cbd5e1; font-size: 12px; }
    #oai-logs-exporter .row { margin-top: 6px; }
    #oai-logs-exporter .fine { font-size: 11px; opacity: .85; }
    #oai-logs-exporter .danger { color: #f87171; }
    #oai-logs-exporter .status { margin-top:8px; font-size:12px; white-space:pre-wrap; max-height:140px; overflow:auto; background: rgba(255,255,255,.06); padding:6px; border-radius:6px;}
  `);

  // パネル DOM の組み立て
  const panel = document.createElement("div");
  panel.id = "oai-logs-exporter";
  panel.innerHTML = `
    <h3>OpenAI Logs Exporter (Unofficial)</h3>
    <div class="fine">A: Auto-scroll capture（ページにフック）</div>
    <div class="row">
      <button id="oai-cap-start">Start Capture</button>
      <button id="oai-cap-stop" class="secondary">Stop & Export</button>
      <button id="oai-cap-clear" class="secondary">Clear</button>
    </div>
    <label class="row"><input id="oai-verbose" type="checkbox"> Verbose console log</label>

    <div class="muted fine" style="margin-top:6px">非公式。将来動かなくなる可能性があります。セッション情報は秘匿してください。</div>
    <div class="status" id="oai-status"></div>
  `;
  document.body.appendChild(panel);

  // 進捗/状態メッセージ表示ヘルパ
  const statusEl = panel.querySelector("#oai-status");
  const setStatus = (msg) => {
    statusEl.textContent = msg;
  };

  // 収集バッファとキャプチャ状態フラグ
  const collector = makeCollector();
  let capturing = false;

  // -----------------------------
  // Inject hook script into page
  // -----------------------------
  // ダッシュボードページの JS 実行環境に、ネットワークフック用のスクリプトを 1 度だけ注入します。
  // この中で fetch / XHR / EventSource / WebSocket をラップし、対象 URL への応答を検知して window.postMessage で転送します。
  let injected = false;
  function injectHookScript() {
    if (injected) return;
    injected = true;

    const code = `
      (function(){
        const HOOK_NS = '__OAI_LOGS_HOOK__';
        if (window[HOOK_NS]) return;
        const state = { capturing: false, verbose: false };

        const urlMatchers = [
          /\\/responses\\b/i,
          /\\/logs\\b/i,
          /\\/requests\\b/i,
          /\\/dashboard-api\\//i,
          /\\/v1\\/responses\\b/i,
          /\\/v1\\/dashboard\\b/i,
          /\\/dashboard\\b/i,
          /\\/dashboard\\/chat\\/completions\\b/i,
          /\\/chat\\/completions\\b/i
        ];
        const looksLikeLogsEndpoint = (url) => urlMatchers.some((re) => re.test(url || ''));

        function log(...args){ if(state.verbose) try{ console.debug('[LogsHook]', ...args);}catch{} }

        function parseMaybeJSON(text){
          if (!text) return null;
          // Try JSON first
          try { return JSON.parse(text); } catch {}
          // Try NDJSON
          try {
            const lines = text.split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);
            if (lines.length > 1) {
              const arr = [];
              for (const ln of lines) { try { arr.push(JSON.parse(ln)); } catch {} }
              if (arr.length) return arr;
            }
          } catch {}
          return null;
        }

        function extractCommon(json){
          // Return array-ish or best-effort
          if (!json) return [];
          if (Array.isArray(json)) return json;

          // common arrays
          if (Array.isArray(json.data)) return json.data;
          if (Array.isArray(json.items)) return json.items;
          if (Array.isArray(json.responses)) return json.responses;
          if (Array.isArray(json.logs)) return json.logs;
          if (Array.isArray(json.completions)) return json.completions;

          // GraphQL edges
          try {
            if (json.data) {
              for (const k of Object.keys(json.data)) {
                const v = json.data[k];
                if (v && Array.isArray(v.edges)) {
                  const nodes = v.edges.map(e => e && (e.node || e)).filter(Boolean);
                  if (nodes.length) return nodes;
                }
              }
            }
          } catch{}

          // single object
          return [json];
        }

        function postPayload(json){
          const payload = extractCommon(json);
          if (!payload || !payload.length) return;
          window.postMessage({ type: 'OAI_LOGS_PAYLOAD', payload }, '*');
        }

        // ---- fetch hook
        const origFetch = window.fetch;
        window.fetch = async function(...args){
          const req = args[0];
          const url = (typeof req==='string') ? req : (req && req.url) || '';
          const res = await origFetch.apply(this, args);
          try {
            if (state.capturing && looksLikeLogsEndpoint(url)) {
              const clone = res.clone();
              const ctype = clone.headers && clone.headers.get && clone.headers.get('content-type') || '';
              if (/application\\/json|ndjson|json\\b/i.test(ctype) || true) {
                const text = await clone.text();
                const json = parseMaybeJSON(text);
                if (json) { postPayload(json); log('fetch captured', url); }
              }
            }
          } catch(e){ log('fetch hook error', e); }
          return res;
        };

        // ---- XHR hook
        const origOpen = XMLHttpRequest.prototype.open;
        const origSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function(method, url){
          this.__oai_url = url;
          return origOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function(){
          this.addEventListener('load', function(){
            try{
              if (state.capturing && looksLikeLogsEndpoint(this.__oai_url)) {
                const text = this.responseText;
                const json = parseMaybeJSON(text);
                if (json) { postPayload(json); log('xhr captured', this.__oai_url); }
              }
            }catch(e){ log('xhr hook error', e); }
          });
          return origSend.apply(this, arguments);
        };

        // ---- EventSource (server-sent events)
        const OrigEventSource = window.EventSource;
        window.EventSource = function(url, conf){
          const es = new OrigEventSource(url, conf);
          if (looksLikeLogsEndpoint(url)) {
            es.addEventListener('message', (ev)=>{
              if (!state.capturing) return;
              const json = parseMaybeJSON(ev.data);
              if (json) { postPayload(json); log('sse captured', url); }
            });
          }
          return es;
        };
        window.EventSource.prototype = OrigEventSource.prototype;
        window.EventSource.CONNECTING = OrigEventSource.CONNECTING;
        window.EventSource.OPEN = OrigEventSource.OPEN;
        window.EventSource.CLOSED = OrigEventSource.CLOSED;

        // ---- WebSocket (best-effort)
        const OrigWS = window.WebSocket;
        window.WebSocket = function(url, protocols){
          const ws = new OrigWS(url, protocols);
          // wrap addEventListener to snoop 'message'
          const origAdd = ws.addEventListener;
          ws.addEventListener = function(type, listener, options){
            if (type === 'message') {
              const wrapped = function(ev){
                try {
                  if (state.capturing && looksLikeLogsEndpoint(url)) {
                    const data = (typeof ev.data === 'string') ? ev.data : '';
                    const json = parseMaybeJSON(data);
                    if (json) { postPayload(json); log('ws captured', url); }
                  }
                } catch(e){}
                return listener.apply(this, arguments);
              };
              return origAdd.call(ws, type, wrapped, options);
            }
            return origAdd.call(ws, type, listener, options);
          };
          return ws;
        };
        window.WebSocket.prototype = OrigWS.prototype;

        // ---- control channel
        window.addEventListener('message', (ev)=>{
          const d = ev.data || {};
          if (d && d.type === 'OAI_HOOK_CMD') {
            if (d.cmd === 'start') {
              state.capturing = true;
              state.verbose = !!d.verbose;
              window.postMessage({type:'OAI_LOGS_STATUS', msg:'Hook active / Capturing…'}, '*');
            } else if (d.cmd === 'stop') {
              state.capturing = false;
              window.postMessage({type:'OAI_LOGS_STATUS', msg:'Hook stopped.'}, '*');
            }
          }
        });

        window.postMessage({type:'OAI_LOGS_STATUS', msg:'Hook injected.'}, '*');
        window[HOOK_NS] = true;
      })();
    `;
    const s = document.createElement("script");
    s.textContent = code;
    document.documentElement.appendChild(s);
    s.remove();
  }

  // receive payloads from page hook
  // ページ側フックからのメッセージを受け取り、
  // - OAI_LOGS_PAYLOAD: 収集した配列/ノード群をコレクタへ投入
  // - OAI_LOGS_STATUS: ページ側フックの状態表示
  window.addEventListener("message", (ev) => {
    const d = ev.data || {};
    if (d.type === "OAI_LOGS_PAYLOAD") {
      const n = collector.tryCommonArrays(d.payload);
      if (n > 0) setStatus(`Captured +${n} (total ${collector.items.length})`);
      if (panel.querySelector("#oai-verbose").checked)
        console.debug("[Userscript] payload", d.payload);
    } else if (d.type === "OAI_LOGS_STATUS") {
      setStatus(d.msg);
    }
  });

  // -----------------------------
  // Auto-scroll capture controls
  // -----------------------------
  // ページ側フックへ制御コマンドを送信 (start/stop, verbose)
  function sendHookCmd(cmd) {
    window.postMessage(
      { type: "OAI_HOOK_CMD", cmd, verbose: !!panel.querySelector("#oai-verbose").checked },
      "*",
    );
  }

  // キャプチャ開始: フック注入 → start 通知 → 自動スクロール開始
  async function startCapture() {
    capturing = true;
    injectHookScript();
    sendHookCmd("start");
    setStatus("Capture started. Scroll the list to load more…");
    autoScrollPump();
  }

  // 停止とエクスポート: 収集件数が 0 の場合は通知のみ。存在すれば JSONL で保存。
  async function stopAndExport() {
    capturing = false;
    sendHookCmd("stop");
    if (collector.items.length === 0) {
      setStatus("No items captured.");
      return;
    }
    downloadJSONL(collector.items, "openai-logs");
    setStatus(`Exported ${collector.items.length} items.`);
  }

  // 収集済みバッファをクリア
  function clearCollected() {
    collector.items.length = 0;
    setStatus("Cleared collected items.");
  }

  // 自動スクロールループ:
  // - スクロール可能な要素を検出し最下部までスクロールして追加ロードを促す
  // - 800ms の待機で描画・データ反映を待つ
  // - 収集件数が増えない状態が 6 回連続 (約 4.8 秒) 続いたら打ち切り
  async function autoScrollPump() {
    const getScrollables = () => {
      const els = Array.from(document.querySelectorAll("body, *"));
      return els.filter((el) => {
        try {
          return el.scrollHeight > el.clientHeight + 10;
        } catch {
          return false;
        }
      });
    };
    let stagnant = 0,
      lastCount = collector.items.length;
    for (let i = 0; i < 9999 && capturing; i++) {
      const scrollables = getScrollables();
      if (scrollables.length === 0)
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      else for (const el of scrollables) el.scrollTop = el.scrollHeight;

      await sleep(800);
      if (collector.items.length === lastCount) stagnant++;
      else {
        stagnant = 0;
        lastCount = collector.items.length;
      }
      setStatus(`Auto-scrolling... collected ${collector.items.length} items`);
      if (stagnant >= 6) {
        setStatus(`No new items. You can Stop & Export.`);
        break;
      }
    }
  }

  // 収集データを JSONL としてダウンロード。
  // Greasemonkey/Tampermonkey 等の GM_download が使える場合はそれを優先、
  // なければ a 要素クリックのフォールバックで保存します。
  function downloadJSONL(items, prefix) {
    const content = toJSONL(items);
    const blob = new Blob([content], { type: "application/json" });
    const name = `${prefix}-${nowStamp()}.jsonl`;
    if (typeof GM_download === "function") {
      const url = URL.createObjectURL(blob);
      GM_download({ url, name, saveAs: true });
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
    }
  }

  // (Option B: cURL pagination) — removed per request

  // -----------------------------
  // Wire up
  // -----------------------------
  // ボタンクリックに各ハンドラを結線
  panel.querySelector("#oai-cap-start").addEventListener("click", startCapture);
  panel.querySelector("#oai-cap-stop").addEventListener("click", stopAndExport);
  panel.querySelector("#oai-cap-clear").addEventListener("click", clearCollected);

  // Auto-inject hook immediately (so遷移直後のリクエストも拾いやすい)
  injectHookScript();
})();
