import { CATEGORIES } from "$lib/constants/categories";
import { type Handle, redirect } from "@sveltejs/kit";

// 日本語コメント: 指定パスを恒久リダイレクト（308）するためのマッピング
const REDIRECTS: Record<string, string> = {
  "/character": "/",
  "/others/terms": "/terms.html",
  "/others/privacy": "/privacy.html",
  "/others/line-reregister": "/line-howto.html",
  "/others/line-cardchange": "/line-howto.html",
  "/others/line-cancel": "/line-howto.html",
  "/others/line-register": "/line-howto.html",
};

// カテゴリの旧パス -> 新パスの恒久リダイレクトテーブル
const CATEGORY_REDIRECTS: Record<string, string> = CATEGORIES.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.oldPath] = category.path;
    return acc;
  },
  {},
);

// 末尾スラッシュの有無を吸収（ただしルート "/" はそのまま）
function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = normalizePath(event.url.pathname);
  // まずカテゴリの旧パスを判定し、なければ静的マッピングを確認
  const targetUrl = CATEGORY_REDIRECTS[pathname] ?? REDIRECTS[pathname];
  if (targetUrl) {
    // 308 は恒久リダイレクト（メソッド・ボディを維持）
    throw redirect(308, targetUrl);
  }

  // 日本語コメント: "/character/:id" を "/characters/:id" へ恒久リダイレクト（クエリは維持）
  if (pathname.startsWith("/character/")) {
    const rest = pathname.slice("/character".length); // 先頭の "/character" を取り除く（先頭は必ず "/"）
    throw redirect(308, `/characters${rest}${event.url.search}`);
  }

  return resolve(event);
};
