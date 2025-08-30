<script lang="ts">
  import CharacterGrid from "$lib/components/CharacterGrid.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import { SITE_NAME, SITE_URL } from "$lib/constants";
  import { CATEGORIES } from "$lib/constants/categories";
  import { CATEGORY_KEYWORDS } from "$lib/constants/category-keywords";
  import { CHARACTERS, type Character } from "$lib/constants/characters";
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

  const heroTitle = `${categoryName}についてAIに相談`;

  const pageTitle = `${categoryName}についてAIに相談 - ${SITE_NAME}`;
  const pageDescription = `${categoryName}についての相談が得意なAIキャラクターに相談してみましょう。`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
</svelte:head>

<Hero title={heroTitle} description={pageDescription} />

<section class="container mx-auto px-4 py-10">
  <h2 class="text-lg font-bold mb-4">
    {categoryName}についての相談が得意なAIキャラクター
  </h2>
  <div class="mb-6">
    <a href="/" class="text-sm text-blue-700 hover:underline"
      >← すべてのキャラクターへ</a
    >
  </div>

  <CharacterGrid characters={filtered} />
</section>
