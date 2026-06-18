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
		<CardTitle class="text-2xl">Tu espacio personal</CardTitle>
		<CardDescription class="text-base">
			Conectá tu billetera para ver tus contribuciones pendientes y votar propuestas.
		</CardDescription>
	</CardHeader>
	<CardContent class="flex flex-col items-center gap-4">
		{#if hasProjectId}
			<appkit-button></appkit-button>
			<Button variant="outline" class="gap-2" onclick={connect}>
				<Wallet class="size-4" />
				Conectar billetera
			</Button>
			<p class="text-muted-foreground text-center text-xs leading-relaxed">
				Usá una billetera conectada a <strong class="text-foreground">Sepolia</strong> (red de prueba).
			</p>
		{:else}
			<p class="text-destructive text-center text-sm">
				Configurá <code>VITE_REOWN_PROJECT_ID</code> en <code>client/.env</code> para habilitar la conexión.
			</p>
		{/if}
	</CardContent>
</Card>