<script lang="ts">
  import { CATEGORIES } from "$lib/constants/categories";
  const logoUrl =
    "https://storage.aiv.co.jp/aisodan/logos/aisodan_logo_bgwhite.png";
</script>

<header class="px-4 py-2 border-b">
  <nav class="container mx-auto flex justify-between items-center">
    <a href="/" class="text-2xl font-bold">
      <img src={logoUrl} alt="AI相談.com" class="max-w-40" />
    </a>
    <p class="text-sm text-gray-500">
      1500万件メッセージ突破！AIチャットサービス「AI相談.com」
    </p>
    <!-- <ul class="flex space-x-4">
      {#each CATEGORIES as category}
        <li>
          <a href={category.path} class="hover:underline">{category.name}</a>
        </li>
      {/each}
    </ul> -->
  </nav>
</header>
