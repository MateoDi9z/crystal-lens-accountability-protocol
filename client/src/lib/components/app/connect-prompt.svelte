<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Gem, Wallet } from "@lucide/svelte";
	import { appKit } from "$lib/web3/appkit";

	const hasProjectId = Boolean(import.meta.env.VITE_REOWN_PROJECT_ID);

	function connect() {
		appKit?.open({ view: "Connect" });
	}
</script>

<Card class="mx-auto max-w-lg border-border/80 bg-card/90 shadow-lg">
	<CardHeader class="text-center">
		<div class="bg-primary/10 text-primary mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
			<Gem class="size-7" />
		</div>
		<CardTitle class="text-2xl">Enter Crystal Lens</CardTitle>
		<CardDescription class="text-base">
			Connect with your wallet or social account to view treasury data, membership, and governance proposals.
		</CardDescription>
	</CardHeader>
	<CardContent class="flex flex-col items-center gap-4">
		{#if hasProjectId}
			<appkit-button></appkit-button>
			<Button variant="outline" class="gap-2" onclick={connect}>
				<Wallet class="size-4" />
				Open connection modal
			</Button>
			<p class="text-muted-foreground text-center text-xs">
				For local testing, connect MetaMask to <strong>Anvil (31337)</strong> at
				<code class="text-foreground">http://127.0.0.1:8545</code>
			</p>
		{:else}
			<p class="text-destructive text-center text-sm">
				Set <code>VITE_REOWN_PROJECT_ID</code> in <code>client/.env</code> to enable Reown.
			</p>
		{/if}
	</CardContent>
</Card>