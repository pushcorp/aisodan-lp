<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";

  export let title: string;
  export let description: string;
  export let align: "center" | "left" = "center";
  const AICHATAPP_URL = "https://aiv.co.jp/aiapp/chats";
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
        style="text-wrap: balance; line-break: strict;"
      >
        {title}
      </h1>
      <p class="mt-4 text-base md:text-lg text-muted-foreground">
        {description}
      </p>
      <div class="mt-4">
        <Button
          href={AICHATAPP_URL}
          class="bg-orange-600 text-white hover:bg-orange-700 rounded-full shadow-md"
          size="lg"
        >
          今すぐチャットで相談する（無料）
        </Button>
      </div>
    </div>
  </div>
  <div class="h-px w-full bg-white/10"></div>
</section>
