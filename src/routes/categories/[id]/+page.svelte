<script lang="ts">
  import CharacterGrid from "$lib/components/CharacterGrid.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import type { Character } from "$lib/constants/characters";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const categoryName: string = $derived(data.categoryName as string);
  const pageTitle: string = $derived(data.pageTitle as string);
  const pageDescription: string = $derived(data.pageDescription as string);
  const heroTitle: string = $derived(data.heroTitle as string);
  const characters: Character[] = $derived(
    (data.characters as Character[]) ?? [],
  );
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

  <CharacterGrid {characters} />
</section>
