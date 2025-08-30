import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const TARGET_BASE_URL = "https://aiv.co.jp/docs/blog/ai";
const HTTP_STATUS_CODE = 308;

/**
 * /news/[id] は外部ドキュメントに恒久リダイレクトする
 */
export function load({ params }: Parameters<PageServerLoad>[0]): ReturnType<PageServerLoad> {
  const targetUrl = `${TARGET_BASE_URL}/${params.id}`;
  throw redirect(HTTP_STATUS_CODE, targetUrl);
}
