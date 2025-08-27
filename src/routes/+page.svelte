<!-- Home page: すべてのキャラクター一覧 -->
<script lang="ts">
  import CharacterGrid from "$lib/components/CharacterGrid.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import { CATEGORIES } from "$lib/constants/categories";
  import { CHARACTERS } from "$lib/constants/characters";
  const title = "AI相談.com — LINEで話せるAIキャラクター";
  const description =
    "気になるキャラを友だち追加して、LINEで今すぐ会話しよう。恋愛、悩み相談、偉人、占い、おもしろ、学習…いろいろ揃ってます。";
</script>

<Hero {title} {description} />

<section class="container mx-auto px-4 py-10">
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
  <CharacterGrid characters={CHARACTERS} />
  <div class="mt-12 text-center text-sm text-muted-foreground">
    ※ このサイトはランディングページです。会話はLINEアプリ上で行えます。
  </div>
</section>
