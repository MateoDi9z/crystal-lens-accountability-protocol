<script lang="ts">
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Gem, Wallet } from "@lucide/svelte";
	import { getAppKit } from "$lib/web3/appkit";
	import { initWeb3 } from "$lib/web3/init";

	const hasProjectId = Boolean(import.meta.env.VITE_REOWN_PROJECT_ID);

	onMount(() => {
		void initWeb3();
	});

	async function connect() {
		await initWeb3();
		getAppKit()?.open({ view: "Connect" });
	}
</script>

<Card class="mx-auto max-w-lg border-border/80 bg-card/90 shadow-lg">
	<CardHeader class="text-center">
		<div class="bg-primary/10 text-primary mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
			<Gem class="size-7" />
		</div>
		<CardTitle class="text-2xl">Tu espacio personal</CardTitle>
		<CardDescription class="text-base">
			Ingresá con tu billetera o con una cuenta social (Google, X, GitHub, etc.) para ver tus
			contribuciones y votar propuestas.
		</CardDescription>
	</CardHeader>
	<CardContent class="flex flex-col items-center gap-4">
		{#if hasProjectId}
			<appkit-button></appkit-button>
			<Button variant="outline" class="gap-2" onclick={connect}>
				<Wallet class="size-4" />
				Conectar
			</Button>
			<p class="text-muted-foreground text-center text-xs leading-relaxed">
				Podés usar las billeteras que tengas instaladas en el navegador o login social. Para
				pagar y votar en Sepolia, tu cuenta necesita fondos de prueba en esa red.
			</p>
		{:else}
			<p class="text-destructive text-center text-sm">
				Configurá <code>VITE_REOWN_PROJECT_ID</code> en <code>client/.env</code> para habilitar la conexión.
			</p>
		{/if}
	</CardContent>
</Card>