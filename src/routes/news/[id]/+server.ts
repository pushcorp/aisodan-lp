import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const TARGET_BASE_URL = "https://aiv.co.jp/docs/blog/ai";

/**
 * /news/[id] を <https://aiv.co.jp/docs/blog/ai/[id]> にリダイレクトする
 */
export const GET: RequestHandler = ({ params }) => {
  const targetUrl = `${TARGET_BASE_URL}/${params.id}`;
  throw redirect(308, targetUrl);
};
