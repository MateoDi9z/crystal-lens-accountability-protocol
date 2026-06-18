<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { AlertCircle } from "@lucide/svelte";
	import { appKit } from "$lib/web3/appkit";
	import { SEPOLIA_CHAIN_ID } from "$lib/stores/dashboard.svelte";

	function switchNetwork() {
		appKit?.open({ view: "Networks" });
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
			Para usar Crystal Lens necesitás estar conectado a <strong class="text-foreground">Sepolia</strong>
			(chain ID {SEPOLIA_CHAIN_ID}). Cambiá la red en tu billetera e intentá de nuevo.
		</p>
		<appkit-network-button></appkit-network-button>
		<button
			type="button"
			class="text-primary text-sm underline-offset-4 hover:underline"
			onclick={switchNetwork}
		>
			Abrir selector de red
		</button>
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