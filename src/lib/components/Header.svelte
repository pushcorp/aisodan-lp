<script lang="ts">
  import { CATEGORIES } from "$lib/constants/categories";
</script>

<header class="p-4 border-b">
  <nav class="container mx-auto flex justify-between items-center">
    <a href="/" class="text-2xl font-bold">AI相談.com</a>
    <!-- <ul class="flex space-x-4">
      {#each CATEGORIES as category}
        <li>
          <a href={category.path} class="hover:underline">{category.name}</a>
        </li>
      {/each}
    </ul> -->
  </nav>
</header>
