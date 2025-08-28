<script lang="ts">
  import CharacterGrid from "$lib/components/CharacterGrid.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import { CATEGORIES } from "$lib/constants/categories";
  import { CATEGORY_KEYWORDS } from "$lib/constants/category-keywords";
  import { CHARACTERS, type Character } from "$lib/constants/characters";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const categoryId: string = data.id;

  // カテゴリの表示名
  const category = CATEGORIES.find((c) => c.path.endsWith(`/${categoryId}`));
  const categoryName = category ? category.name : "カテゴリー";

  const keywords = CATEGORY_KEYWORDS[categoryId] ?? [];
  function isMatched(character: Character): boolean {
    if (keywords.length === 0) return true;
    const hay = `${character.name} ${character.firstMessage}`;
    return keywords.some((kw) => hay.includes(kw));
  }

  const filtered = CHARACTERS.filter(isMatched);

  const title = `${categoryName} AIキャラクター一覧`;
  const description = `「${categoryName}」のカテゴリのAIキャラクターをピックアップ。気になるキャラを友だち追加して、LINEで今すぐ会話しよう。`;

  console.log("カテゴリ:", category);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<Hero {title} {description} />

<section class="container mx-auto px-4 py-10">
  <div class="mb-6">
    <a href="/" class="text-sm text-blue-700 hover:underline"
      >← すべてのキャラクターへ</a
    >
  </div>
  <CharacterGrid characters={filtered} />
</section>
