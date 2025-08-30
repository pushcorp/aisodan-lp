// src/routes/sitemap.txt/+server.ts
// 最新のsitemap.txtを生成してtxtファイルを返すエンドポイント
import { CATEGORIES } from "$lib/constants/categories";
import { CHARACTERS } from "$lib/constants/characters";

const CACHE_CONTROL = "max-age=0, s-maxage=3600"; // 1時間キャッシュ

// NOTE: プレーンテキストでURLを改行区切りで返す
export async function GET({ url }: { url: URL }) {
  const origin = url.origin;

  // ルートと静的ページ
  const STATIC_PATHS = ["/line-howto.html", "/privacy.html", "/terms.html"] as const;

  const rootUrl = `${origin}/`;
  const staticUrls = STATIC_PATHS.map((path) => `${origin}${path}`);

  // カテゴリーページ（新パスのみを採用）
  const categoryUrls = CATEGORIES.map((category) => `${origin}${category.path}`);

  // キャラクターページ（/characters/[id]）
  const characterUrls = CHARACTERS.map((ch) => `${origin}/characters/${ch.id}`);

  const body = [rootUrl, ...staticUrls, ...categoryUrls, ...characterUrls].join("\n") + "\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      // CDN等がある場合のキャッシュ
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
