<script lang="ts">
	import "../app.css";
	import "../styles.css";
	import Analytics from "$lib/components/Analytics.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";
	let { children } = $props();
</script>

<Analytics />

<Header />
<main>
	{@render children()}
</main>
<Footer />
