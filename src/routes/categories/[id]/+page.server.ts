import { SITE_NAME } from "$lib/constants";
import { CATEGORIES } from "$lib/constants/categories";
import { CATEGORY_KEYWORDS } from "$lib/constants/category-keywords";
import { CHARACTERS } from "$lib/constants/characters";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  // サーバー側でカテゴリ情報・メタ情報・キャラクター一覧を計算
  const id = params.id;
  if (!id) {
    error(404, "Not found");
  }

  const category = CATEGORIES.find((c) => c.path.endsWith(`/${id}`));
  const categoryName = category ? category.name : "カテゴリー";

  const keywords = CATEGORY_KEYWORDS[id] ?? [];
  function isMatched(character: { name: string; firstMessage: string }): boolean {
    if (keywords.length === 0) return true;
    const hay = `${character.name} ${character.firstMessage}`;
    return keywords.some((kw) => hay.includes(kw));
  }

  // 追加する「一致しないキャラクター」の最大件数
  const MAX_EXTRA_CHARACTERS = 30;

  // 配列をランダムシャッフル（Fisher–Yates）
  function shuffleArray<T>(input: T[]): T[] {
    const array = input.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  }

  // カテゴリーに一致するキャラクターは最大限表示（定義順のまま）
  const matched = CHARACTERS.filter(isMatched);
  // それ以外はランダムで最大30件だけ追加
  const others = CHARACTERS.filter((c) => !isMatched(c));
  const randomOthers = shuffleArray(others).slice(0, MAX_EXTRA_CHARACTERS);
  const characters = [...matched, ...randomOthers];

  const heroTitle = `${categoryName}についてAIに相談`;
  const pageTitle = `${categoryName}についてAIに無料で相談 - ${SITE_NAME}`;
  const pageDescription = `${categoryName}についての相談が得意なAIキャラクターに相談してみましょう。`;

  return {
    id,
    categoryName,
    heroTitle,
    pageTitle,
    pageDescription,
    characters,
  };
};
