# TODO

- [x] <https://aisodan.com/news/12345> から <https://aiv.co.jp/docs/blog/ai/12345> にリダイレクトする処理を実装　（12345はダミー。）
- [x] ヘッダーにロゴを追加
- [x] フッター外部リンクを有効なものに差し替え
- [x] 利用規約、プラポリを追加
- [x] LINEヘルプ記事を1ページとして実装。これの内容を：
<https://aisodan.com/others/line-reregister>
<https://aisodan.com/others/line-cardchange>
<https://aisodan.com/others/line-cancel>
<https://aisodan.com/others/line-register>
- [x] characters/[id] ページのランダムキャラクターのレンダリングが読み込み時と読み込み後の2回行われ、さらに画像と名前が一致していない問題を修正する。コンソールにwarnのログが出力されていたので参考になるかもしれません: → console.warn logs: ```hook.js:608 [svelte] hydration_attribute_changedThe `src` attribute on `<img src="https://storage.aiv.co.jp/aisodan/characters/okane.jpg" alt="お金のアドバイザー綾瀬さん" class="w-full h-48 object-cover" loading="lazy" decoding="async">` changed its value between server and client renders. The client value, `https://storage.aiv.co.jp/aisodan/characters/spy_meguru.jpg`, will be ignored in favour of the server valuehttps://svelte.dev/e/hydration_attribute_changed
overrideMethod @ hook.js:608
hook.js:608 [svelte] hydration_attribute_changedThe `src` attribute on `<img src="https://storage.aiv.co.jp/aisodan/characters/uranai_tarot.jpg" alt="タロット占い" class="w-full h-48 object-cover" loading="lazy" decoding="async">` changed its value between server and client renders. The client value, `https://storage.aiv.co.jp/aisodan/characters/gamble_yuka.jpeg`, will be ignored in favour of the server valuehttps://svelte.dev/e/hydration_attribute_changed```
- [ ] characters/[id] ランダムキャラクターの上に人気キャラクターを同様UIで並べる。
