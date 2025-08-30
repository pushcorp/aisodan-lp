<script lang="ts">
  import CharacterCard from "$lib/components/CharacterCard.svelte";
  import type { Character } from "$lib/constants/characters";
  export let characters: Character[] = [];
  export let emptyText: string = "該当するキャラクターが見つかりませんでした。";
</script>

{#if characters.length === 0}
  <p class="text-muted-foreground">{emptyText}</p>
{:else}
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
    {#each characters as c (c.id)}
      <CharacterCard character={c} />
    {/each}
  </div>
{/if}
