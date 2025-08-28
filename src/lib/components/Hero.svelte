<script lang="ts">
  // ヒーローセクションの共通コンポーネント
  // - title: 大きなキャッチコピー
  // - description: 小さな説明文
  // - align: テキストの配置
  export let title: string;
  export let description: string;
  export let align: "center" | "left" = "center";
</script>

<section class="text-black">
  <div class="container mx-auto px-4 py-10 md:py-24">
    <div
      class={align === "center"
        ? "text-center max-w-3xl mx-auto"
        : "text-left max-w-3xl"}
    >
      <h1
        class="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400
           bg-clip-text text-transparent"
      >
        {title}
      </h1>
      <p class="mt-4 text-base md:text-lg text-muted-foreground">
        {description}
      </p>
    </div>
  </div>
  <div class="h-px w-full bg-white/10"></div>
</section>
