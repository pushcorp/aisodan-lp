import { CHARACTERS, type Character } from "$lib/constants/characters";
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

  const id = params.id;
  const character = CHARACTERS.find((c) => c.id === id);
  const recommended = pickRecommendations(id, 8);

  return {
    id,
    character,
    recommended,
  };
};
