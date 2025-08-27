<script lang="ts">
  import CharacterGrid from "$lib/components/CharacterGrid.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { CHARACTERS, type Character } from "$lib/constants/characters";
  import { ExternalLink } from "@lucide/svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  // ページパラメータ
  const characterId: string = data.id;

  // 対象キャラ
  const character = CHARACTERS.find((c) => c.id === characterId);

  function pickRecommendations(currentId: string, limit = 8): Character[] {
    const others = CHARACTERS.filter((c) => c.id !== currentId);
    // シャッフルして上位を返す
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    return others.slice(0, limit);
  }

  const recommended: Character[] = character
    ? pickRecommendations(character.id, 8)
    : [];

  const title = character
    ? `${character.name}`
    : "キャラクターが見つかりません";
  const description = character
    ? character.firstMessage
    : "指定されたキャラクターは存在しません。トップページからお探しください。";
</script>

<Hero {title} {description} />

<section class="container mx-auto px-4 py-10">
  {#if character}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      <div class="md:col-span-1">
        <img
          src={character.iconImageUrl}
          alt={character.name}
          class="w-full rounded-xl border object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
      <div class="md:col-span-2 space-y-4">
        <h2 class="text-2xl font-bold">{character.name}</h2>
        <p class="text-muted-foreground">{character.firstMessage}</p>
        {#if character.lineLink}
          <div class="pt-2">
            <Button
              href={character.lineLink}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              LINEで友だち追加 <ExternalLink class="size-5" />
            </Button>
          </div>
        {/if}
        <div class="text-sm text-muted-foreground">
          ※ AIキャラクターとの会話はLINEアプリ上で行えます。
        </div>
      </div>
    </div>

    <div class="mt-12">
      <h3 class="text-xl font-semibold mb-4">ほかのおすすめキャラクター</h3>
      <CharacterGrid characters={recommended} />
    </div>
  {:else}
    <div class="space-y-6">
      <p>お探しのキャラクターは見つかりませんでした。</p>
      <a href="/" class="text-blue-700 hover:underline">トップページへ戻る</a>
    </div>
  {/if}
</section>
