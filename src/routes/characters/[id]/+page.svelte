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
  const pageTitle: string = $derived(data.pageTitle as string);
  const pageDescription: string = $derived(data.pageDescription as string);
  const newId: string | undefined = $derived(data.new_id as string | undefined);
  const chatCharacterId: string | undefined = $derived(newId ?? character?.id);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
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
        <div class="pt-2 text-center">
          <Button
            href={chatCharacterId
              ? `https://aiv.co.jp/aiapp/chats/character/${chatCharacterId}`
              : undefined}
            target="_blank"
            class="bg-blue-500 text-white text-md w-full max-w-lg rounded-full py-6 shadow-md"
            size="lg"
          >
            チャットで今すぐ相談する
          </Button>
        </div>

        {#if character.lineLink}
          <div class="pt-2 text-center">
            <p class="text-sm text-muted-foreground">
              このキャラクターはLINEでも提供しています。
              <br />
              （ただし完全別サービスとなり、有料プランも別となります。）
            </p>
            <a
              href={character.lineLink}
              target="_blank"
              rel="nofollow noopener noreferrer"
              class="text-blue-500 hover:underline"
            >
              LINE版はこちら
            </a>
          </div>
        {/if}
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
