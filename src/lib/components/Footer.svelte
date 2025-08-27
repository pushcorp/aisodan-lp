<script lang="ts">
  import { CATEGORIES } from "$lib/constants/categories";
  import { EXTERNAL_LINKS } from "$lib/constants/links";
</script>

<footer class="bg-gray-800 text-white p-8">
  <div class="container mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div>
        <h3 class="font-bold mb-2">カテゴリー</h3>
        <ul>
          {#each CATEGORIES as category}
            <li>
              <a href={category.path} class="hover:underline text-sm"
                >{category.name}</a
              >
            </li>
          {/each}
        </ul>
      </div>
      <div>
        <h3 class="font-bold mb-2">サポート</h3>
        <ul>
          <li>
            <a
              href={EXTERNAL_LINKS.terms.href}
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline text-sm">{EXTERNAL_LINKS.terms.label}</a
            >
          </li>
          <li>
            <a
              href={EXTERNAL_LINKS.privacy.href}
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline text-sm">{EXTERNAL_LINKS.privacy.label}</a
            >
          </li>
          <li>
            <a
              href={EXTERNAL_LINKS.tokushoho.href}
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline text-sm"
              >{EXTERNAL_LINKS.tokushoho.label}</a
            >
          </li>
          <li>
            <a
              href={EXTERNAL_LINKS.company.href}
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline text-sm">{EXTERNAL_LINKS.company.label}</a
            >
          </li>
        </ul>
      </div>
    </div>
    <div class="text-center">
      <a href="/" class="text-2xl font-bold">AI相談.com</a>
    </div>
  </div>
</footer>
