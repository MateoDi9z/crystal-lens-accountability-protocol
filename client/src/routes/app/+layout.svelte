<script lang="ts">
	import { onMount } from "svelte";
	import AppHeader from "$lib/components/app/app-header.svelte";
	import ActionErrorModal from "$lib/components/app/action-error-modal.svelte";
	import TransactionProgressModal from "$lib/components/app/transaction-progress-modal.svelte";
	import Footer from "$lib/components/landing/footer.svelte";
	import "$lib/web3/appkit";
	import { initWeb3 } from "$lib/web3/init";

	let { children } = $props();

	onMount(() => {
		void initWeb3();
	});
</script>

<AppHeader />
<main class="bg-background min-h-screen pt-16">
	{@render children()}
</main>
<TransactionProgressModal />
<ActionErrorModal />
<Footer />