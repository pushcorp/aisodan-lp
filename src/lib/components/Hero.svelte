<script lang="ts">
  // ヒーローセクションの共通コンポーネント
  // - title: 大きなキャッチコピー
  // - description: 小さな説明文
  // - align: テキストの配置
  export let title: string;
  export let description: string;
  export let align: "center" | "left" = "center";
</script>

<section class="bg-gradient-to-b from-blue-600 to-blue-500 text-white">
  <div class="container mx-auto px-4 py-16 md:py-24">
    <div
      class={align === "center"
        ? "text-center max-w-3xl mx-auto"
        : "text-left max-w-3xl"}
    >
      <h1
        class="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
      >
        {title}
      </h1>
      <p class="mt-4 text-base md:text-lg text-white/90">
        {description}
      </p>
    </div>
  </div>
  <div class="h-px w-full bg-white/10"></div>
  <div class="h-4 w-full bg-blue-500/20"></div>
</section>
