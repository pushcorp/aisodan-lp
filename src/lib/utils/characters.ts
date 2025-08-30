import type { Character } from "$lib/constants/characters";

/**
 * 人気キャラクター一覧を ID の順序を維持して抽出するユーティリティ
 * - 不正な ID は除外
 */
export function getPopularCharacters(
  allCharacters: Character[],
  popularIds: string[],
): Character[] {
  const idToCharacter = new Map<string, Character>(allCharacters.map((c) => [c.id, c]));

  const result: Character[] = [];
  for (const id of popularIds) {
    const found = idToCharacter.get(id);
    if (found) {
      result.push(found);
    }
  }
  return result;
}
