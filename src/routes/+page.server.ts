import { CHARACTERS, POPULAR_CHARACTER_IDS } from "$lib/constants/characters";
import type { PageServerLoad } from "./$types";

/**
 * 日付ベースのシードを使って配列をシャッフルする（Fisher-Yates）
 * 同じ日付なら同じ結果になる
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;

  // 疑似乱数生成器（線形合同法）
  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * 日本時間の今日の日付をYYYYMMDD形式の数値で取得
 */
function getJSTDateSeed(): number {
  const now = new Date();
  // 日本時間に変換
  const jstOffset = 9 * 60; // JSTはUTC+9
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const jstTime = new Date(utc + jstOffset * 60 * 1000);

  const year = jstTime.getFullYear();
  const month = jstTime.getMonth() + 1;
  const day = jstTime.getDate();

  return year * 10000 + month * 100 + day;
}

/**
 * 人気キャラクターをID昇順で取得（固定1～5位）
 */
function getTopFixedCharacters(
  allCharacters: typeof CHARACTERS,
  popularIds: string[],
) {
  const idToCharacter = new Map(allCharacters.map((c) => [c.id, c]));

  return popularIds
    .map((id) => idToCharacter.get(id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .sort((a, b) => Number(a.id) - Number(b.id))
    .slice(0, 5);
}

export const load: PageServerLoad = async () => {
  // 1. 固定表示（1～5位）：人気キャラをID昇順でソート
  const topFixed = getTopFixedCharacters(CHARACTERS, POPULAR_CHARACTER_IDS);

  // 2. 日替わりシャッフル（6位以降）
  // 人気キャラのIDセットを作成
  const topIds = new Set(topFixed.map((c) => c.id));

  // 残りのキャラクター（人気キャラ以外）
  const remainingCharacters = CHARACTERS.filter((c) => !topIds.has(c.id));

  // 日本時間の日付をシードにしてシャッフル
  const dateSeed = getJSTDateSeed();
  const shuffledRemaining = seededShuffle(remainingCharacters, dateSeed);

  // 統合したリスト
  const allCharacters = [...topFixed, ...shuffledRemaining];

  return { characters: allCharacters };
};
