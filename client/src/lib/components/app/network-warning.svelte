<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { AlertCircle, Globe } from "@lucide/svelte";
	import { getAppKit } from "$lib/web3/appkit";
	import { initWeb3 } from "$lib/web3/init";
	import { SEPOLIA_CHAIN_ID } from "$lib/stores/dashboard.svelte";

	const networkName = $derived(SEPOLIA_CHAIN_ID === 31337 ? "Anvil (Localhost)" : "Sepolia");

	async function switchNetwork() {
		await initWeb3();
		getAppKit()?.open({ view: "Networks" });
	}
</script>

<Card class="border-destructive/30 mx-auto max-w-lg">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-lg">
			<AlertCircle class="text-destructive size-5" />
			Red incorrecta
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4 text-sm">
		<p class="text-muted-foreground leading-relaxed">
			Para usar Crystal Lens necesitás estar conectado a <strong class="text-foreground">{networkName}</strong>
			(chain ID {SEPOLIA_CHAIN_ID}). Cambiá la red en tu billetera e intentá de nuevo.
		</p>
		<Button variant="outline" class="gap-2" onclick={switchNetwork}>
			<Globe class="size-4" />
			Cambiar a {networkName}
		</Button>
		<p class="text-muted-foreground text-xs">
			¿No tenés Sepolia ETH?
			<a
				href="https://sepoliafaucet.com/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-primary underline-offset-4 hover:underline"
			>
				Conseguí ETH de prueba acá
			</a>
		</p>
	</CardContent>
</Card>