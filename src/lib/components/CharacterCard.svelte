<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { ExternalLink } from "@lucide/svelte";

  import type { Character } from "$lib/constants/characters";
  export let character: Character;
</script>

<div
  class="group rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition hover:shadow-md"
>
  <a class="block" href={`/characters/${character.id}`}>
    <img
      src={character.iconImageUrl}
      alt={character.name}
      class="w-full h-48 object-cover"
      loading="lazy"
      decoding="async"
    />
  </a>
  <div class="p-4 space-y-3">
    <a href={`/characters/${character.id}`} class="block">
      <h3 class="font-bold text-lg leading-snug line-clamp-2">
        {character.name}
      </h3>
    </a>
    <p class="text-sm text-muted-foreground line-clamp-2">
      {character.firstMessage}
    </p>
    {#if character.lineLink}
      <div>
        <Button
          href={character.lineLink}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="sm"
        >
          友だち追加 <ExternalLink class="size-4" />
        </Button>
      </div>
    {/if}
  </div>
</div>
