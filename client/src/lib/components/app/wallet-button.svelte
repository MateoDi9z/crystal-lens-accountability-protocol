<script lang="ts">
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import AddressActions from "$lib/components/app/address-actions.svelte";
	import { ChevronDown, Wallet } from "@lucide/svelte";
	import { getAppKit, isReownConfigured } from "$lib/web3/appkit";
	import { initWeb3 } from "$lib/web3/init";
	import { getDashboardState } from "$lib/stores/dashboard.svelte";
	import { cn } from "$lib/utils";

	type WalletButtonSize = "sm" | "default" | "lg";

	let {
		size = "default",
		class: className = ""
	}: {
		size?: WalletButtonSize;
		class?: string;
	} = $props();

	const dashboard = getDashboardState();
	let ready = $state(false);

	onMount(() => {
		void initWeb3().finally(() => {
			ready = true;
		});
	});

	async function handleClick() {
		if (!isReownConfigured()) return;
		await initWeb3();
		const kit = getAppKit();
		if (dashboard.isConnected) {
			kit?.open({ view: "Account" });
		} else {
			kit?.open({ view: "Connect" });
		}
	}

	function shortenAddress(address: string) {
		return `${address.slice(0, 6)}…${address.slice(-4)}`;
	}
</script>

{#if dashboard.isConnected && dashboard.address}
	<div class={cn("flex items-center gap-1", className)}>
		<Button
			variant="outline"
			{size}
			class="gap-1.5 font-mono"
			onclick={handleClick}
		>
			{shortenAddress(dashboard.address)}
			<ChevronDown class="text-muted-foreground size-3.5" />
		</Button>
		<AddressActions address={dashboard.address} />
	</div>
{:else}
	<Button
		{size}
		class={cn("gap-2", className)}
		onclick={handleClick}
		disabled={!ready && isReownConfigured()}
	>
		<Wallet class="size-4" />
		Conectar
	</Button>
{/if}