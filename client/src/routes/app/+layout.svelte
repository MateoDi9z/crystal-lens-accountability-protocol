<script lang="ts">
	import AppHeader from "$lib/components/app/app-header.svelte";
	import Footer from "$lib/components/landing/footer.svelte";
	import "$lib/web3/appkit";

	let { children } = $props();
</script>

<AppHeader />
<main class="bg-background min-h-screen pt-16">
	{@render children()}
</main>
<Footer />