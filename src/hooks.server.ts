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

// 日本語コメント: 末尾スラッシュの有無を吸収（ただしルート "/" はそのまま）
function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = normalizePath(event.url.pathname);
  const targetUrl = REDIRECTS[pathname];
  if (targetUrl) {
    // 日本語コメント: 308 は恒久リダイレクト（メソッド・ボディを維持）
    throw redirect(308, targetUrl);
  }

  return resolve(event);
};
