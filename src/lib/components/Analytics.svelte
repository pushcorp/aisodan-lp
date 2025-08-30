<script lang="ts">
  import { browser, dev } from "$app/environment";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  // Google Analytics の計測ID（環境変数化する場合はここを変更）
  const GA_MEASUREMENT_ID = "G-9HN402YGK2";

  // Window の型をローカルで拡張（グローバル汚染を避ける）
  type GtagFunction = (...args: unknown[]) => void;
  interface AnalyticsWindow extends Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
    __AISODAN_GA_INITIAL_SENT?: boolean;
  }

  // 直近でトラッキングしたパスを保持し、二重送信を防止する
  let lastTrackedPath: string | null = null;

  /**
   * 現在のパスを生成（SPA の重複送信防止で使用）
   */
  function getCurrentPath(): string {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  /**
   * dataLayer / gtag のスタブ作成 + 基本設定（自動 page_view 無効化）
   */
  function initGtag(): void {
    const w = window as AnalyticsWindow;
    if (!w.dataLayer) {
      w.dataLayer = [];
    }
    if (typeof w.gtag !== "function") {
      w.gtag = function (...args: unknown[]) {
        if (!w.dataLayer) {
          w.dataLayer = [];
        }
        w.dataLayer.push(args);
      };
    }
    const gtagFn = w.gtag;
    gtagFn("js", new Date());
    gtagFn("config", GA_MEASUREMENT_ID, { send_page_view: false });
  }

  /**
   * ルーティングごとの page_view を手動送信する
   */
  function trackPageView(): void {
    const path = getCurrentPath();
    if (lastTrackedPath === path) {
      return;
    }
    lastTrackedPath = path;

    const gtagFn = (window as AnalyticsWindow).gtag as GtagFunction | undefined;
    if (!gtagFn) {
      return;
    }

    // 計測する
    gtagFn("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: path,
    });
    console.log("page_view sent in CSR or dev mode SSR");
  }

  onMount(() => {
    // CSRの場合の処理（主にページ遷移時）

    // dataLayer / gtag 準備 + 自動 page_view 無効化
    initGtag();

    // gtag.js を読み込み（未読込なら追加）
    const src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = src;
      document.head.appendChild(script);
    }

    // 初回ロードの page_view を送信（head で送信済みならスキップ）
    if ((window as AnalyticsWindow).__AISODAN_GA_INITIAL_SENT) {
      lastTrackedPath = getCurrentPath();
    } else {
      trackPageView();
      (window as AnalyticsWindow).__AISODAN_GA_INITIAL_SENT = true;
    }

    // 以降のクライアントサイド遷移は runes で検知（下部の $effect で処理）
  });

  // ルート変更を runes で検知して手動 page_view を送信
  $effect(() => {
    // page.url の変化に依存させる
    void page.url.pathname;
    void page.url.search;
    void page.url.hash;

    trackPageView();
  });
</script>

<svelte:head>
  <!-- 本番環境 & フルSSR時に実行 -->
  {#if !dev}
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
    ></script>
    <script data-ga-id={GA_MEASUREMENT_ID}>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      } // GAサーバーサイド配信向け（CSR無効時も実行される）
      gtag("js", new Date());
      // 自動 page_view を無効化し、手動送信で統一（重複防止）参考：https://developers.google.com/analytics/devguides/collection/ga4/views?hl=ja&client_type=gtag#manual_pageviews
      var mid =
        document.currentScript &&
        document.currentScript.getAttribute("data-ga-id");
      gtag("config", mid, { send_page_view: false });
      // 手動で page_view を送信（各ページのフルリロード時に送られる）
      gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search + location.hash,
      });
      window.__AISODAN_GA_INITIAL_SENT = true;
      console.log("page_view sent in SSR and production mode");
    </script>
  {/if}
</svelte:head>
