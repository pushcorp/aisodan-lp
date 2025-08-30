import { CHARACTERS, POPULAR_CHARACTER_IDS } from "$lib/constants/characters";
import { getPopularCharacters } from "$lib/utils/characters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const popular = getPopularCharacters(CHARACTERS, POPULAR_CHARACTER_IDS);
  return { popular };
};
