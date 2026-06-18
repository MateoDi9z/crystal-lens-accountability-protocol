<script lang="ts">
	import Header from "$lib/components/landing/header.svelte";
	import Footer from "$lib/components/landing/footer.svelte";

	let { children } = $props();
</script>

<Header solid />
<main class="bg-background min-h-screen pt-16">
	{@render children()}
</main>
<Footer />