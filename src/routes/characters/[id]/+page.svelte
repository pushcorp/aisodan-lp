<script lang="ts">
  import CharacterGrid from "$lib/components/CharacterGrid.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { Character } from "$lib/constants/characters";
  import { ExternalLink } from "@lucide/svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  // 対象キャラとおすすめ（サーバーから提供）
  const character: Character | undefined = $derived(
    data.character as Character | undefined,
  );
  const recommendedCharacters: Character[] = $derived(
    (data.recommended as Character[]) ?? [],
  );
  const popularCharacters: Character[] = $derived(
    (data.popular as Character[]) ?? [],
  );

  const title: string = $derived(
    character ? `${character.name}` : "キャラクターが見つかりません",
  );
  const description: string = $derived(
    character
      ? character.firstMessage
      : "指定されたキャラクターは存在しません。トップページからお探しください。",
  );
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<section class="container mx-auto px-4 py-10">
  {#if character}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      <div class="md:col-span-1">
        <img
          src={character.iconImageUrl}
          alt={character.name}
          class="w-full max-w-96 max-h-96 mx-auto rounded-xl border object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
      <div class="md:col-span-2 space-y-4">
        <p class="text-sm text-muted-foreground">AIキャラクター</p>
        <h1 class="text-2xl font-bold">{character.name}</h1>
        <p class="px-4 py-2 bg-muted rounded-full">{character.firstMessage}</p>
        {#if character.lineLink}
          <div class="pt-2">
            <Button
              href={character.lineLink}
              target="_blank"
              rel="nofollow noopener noreferrer"
              class="bg-[#06C755] hover:bg-[#05b44d] text-white text-md w-full max-w-lg rounded-full py-6 shadow-md"
              size="lg"
            >
              LINEで友だち追加 <ExternalLink class="size-5" />
            </Button>
          </div>
        {/if}
        <div class="text-sm text-muted-foreground text-center">
          <p class="mb-2">※ AIキャラクターとの会話はLINEアプリ上で行えます。</p>
          <a
            href="https://pushcorp.notion.site/25104db1911c807f9f24fb2ad063ee83"
            class="text-blue-700 hover:underline"
          >
            AI相談をWebサイトで使いたい方はこちら【Web版準備中】
          </a>
        </div>
      </div>
    </div>

    <div class="mt-12">
      <h3 class="text-xl font-semibold mb-4">人気のAIキャラクター</h3>
      <CharacterGrid characters={popularCharacters} />
    </div>

    <div class="mt-12">
      <h3 class="text-xl font-semibold mb-4">ほかのおすすめキャラクター</h3>
      <CharacterGrid characters={recommendedCharacters} />
    </div>
  {:else}
    <div class="space-y-6">
      <p>お探しのキャラクターは見つかりませんでした。</p>
      <a href="/" class="text-blue-700 hover:underline">トップページへ戻る</a>
    </div>
  {/if}
</section>
