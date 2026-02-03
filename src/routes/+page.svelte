<!-- Home page: すべてのキャラクター一覧 -->
<script lang="ts">
  import CharacterGrid from "$lib/components/CharacterGrid.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import { SITE_NAME } from "$lib/constants";
  import { CATEGORIES } from "$lib/constants/categories";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
  const heroTitle = "ぜんぶ、AIに相談しよう。";
  const heroDescription =
    "恋愛、友だち、学校、仕事、人には話しづらい悩みなど... ぜんぶ、AIに相談しましょう。AI相談.comは、1,500万以上のメッセージ件数を誇る日本最大級のAIチャットサービスです。会話データがAI学習に利用されないプライバシー保護をおこなっているため、安心してご利用いただけます。";

  const pageTitle = `${SITE_NAME}: 無料でAIに相談・チャットできる`;
  const pageDescription = heroDescription;

  const characters = (data as any)?.characters ?? [];
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
</svelte:head>

<Hero title={heroTitle} description={heroDescription} />

<section class="container mx-auto px-4 py-10">
  <h2 class="text-lg font-bold mb-4">AIキャラクター一覧</h2>
  <div class="mb-6 flex flex-wrap items-center gap-2">
    {#each CATEGORIES as category}
      <a
        href={category.path}
        class="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
      >
        {category.name}
      </a>
    {/each}
  </div>
  <CharacterGrid {characters} />
</section>
