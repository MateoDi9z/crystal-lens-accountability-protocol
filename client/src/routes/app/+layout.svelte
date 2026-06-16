<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import "$lib/web3/appkit";
	import { initWalletWatch } from "$lib/stores/wallet.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Gem, ArrowLeft } from "@lucide/svelte";
	import ModeToggle from "$lib/components/landing/mode-toggle.svelte";

	let { children } = $props();

	onMount(() => {
		if (!browser) return;
		return initWalletWatch();
	});
</script>

<div class="min-h-screen">
	<header class="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
		<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
			<a href="/app" class="flex items-center gap-2.5 font-semibold tracking-tight">
				<div class="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
					<Gem class="size-4" />
				</div>
				<span class="hidden sm:block">Crystal Lens App</span>
			</a>

			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" href="/" class="gap-1.5">
					<ArrowLeft class="size-3.5" />
					<span class="hidden sm:inline">Landing</span>
				</Button>
				<ModeToggle />
				{#if import.meta.env.VITE_REOWN_PROJECT_ID}
					<appkit-button></appkit-button>
				{/if}
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
		{@render children()}
	</main>
</div>