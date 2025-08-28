<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { ExternalLink } from "@lucide/svelte";

  import type { Character } from "$lib/constants/characters";
  export let character: Character;
</script>

<a class="block" href={`/characters/${character.id}`}>
  <div
    class="group rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition hover:shadow-lg"
  >
    <img
      src={character.iconImageUrl}
      alt={character.name}
      class="w-full h-48 object-cover"
      loading="lazy"
      decoding="async"
    />

    <div class="p-4 space-y-3">
      <h3 class="font-bold text-lg leading-snug line-clamp-2">
        {character.name}
      </h3>
      <p class="px-4 py-2 text-sm bg-muted rounded-full">
        {character.firstMessage}
      </p>
    </div>
  </div>
</a>
