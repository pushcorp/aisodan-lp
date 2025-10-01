import { SITE_NAME } from "$lib/constants";
import {
  CHARACTERS,
  type Character,
  POPULAR_CHARACTERS_NEW_ID_MAP,
  POPULAR_CHARACTER_IDS,
} from "$lib/constants/characters";
import { getPopularCharacters } from "$lib/utils/characters";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

function pickRecommendations(currentId: string, limit = 8): Character[] {
  const others = CHARACTERS.filter((c) => c.id !== currentId);
  // フィッシャー–イェーツ (Fisher-Yates) のシャッフルで順序をランダム化
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, limit);
}

export const load: PageServerLoad = async ({ params }) => {
  if (!params.id) {
    error(404, "Not found");
  }

  const requestedId = params.id;
  let resolvedId = requestedId;

  let character = CHARACTERS.find((c) => c.id === resolvedId);

  if (!character) {
    const entry = Object.entries(POPULAR_CHARACTERS_NEW_ID_MAP).find(
      ([, newId]) => newId === requestedId,
    );
    if (entry) {
      resolvedId = entry[0];
      character = CHARACTERS.find((c) => c.id === resolvedId);
    }
  }

  if (!character) {
    error(404, "Not found");
  }

  const newId =
    resolvedId in POPULAR_CHARACTERS_NEW_ID_MAP
      ? POPULAR_CHARACTERS_NEW_ID_MAP[resolvedId as keyof typeof POPULAR_CHARACTERS_NEW_ID_MAP]
      : undefined;

  const recommended = pickRecommendations(resolvedId, 8);
  const popular = getPopularCharacters(CHARACTERS, POPULAR_CHARACTER_IDS);

  // SEO 用のタイトルとディスクリプションはサーバーで生成して返す
  const pageTitle = character
    ? `${character.name} - ${SITE_NAME}`
    : `キャラクターが見つかりません - ${SITE_NAME}`;
  const pageDescription = character
    ? character.firstMessage
    : "指定されたキャラクターは存在しません。トップページからお探しください。";

  return {
    id: requestedId,
    new_id: newId,
    character,
    recommended,
    popular,
    pageTitle,
    pageDescription,
  };
};
