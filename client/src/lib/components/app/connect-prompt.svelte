<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import WalletButton from "$lib/components/app/wallet-button.svelte";
	import { Gem } from "@lucide/svelte";
</script>

<Card class="mx-auto max-w-lg overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
	<div class="relative">
	<CardHeader class="text-center">
		<div class="bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20 mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl shadow-inner">
			<Gem class="size-8 drop-shadow-md" />
		</div>
		<CardTitle class="text-3xl font-bold tracking-tight">Tu espacio personal</CardTitle>
		<CardDescription class="text-base mt-2">
			Ingresá fácilmente usando tu cuenta de Google, GitHub o X. También podés usar tu billetera virtual si ya tenés una.
		</CardDescription>
	</CardHeader>
	<CardContent class="flex flex-col items-center gap-4">
		<WalletButton size="lg" />
		<p class="text-muted-foreground text-center text-sm leading-relaxed max-w-[400px]">
			Sin complicaciones técnicas. Iniciá sesión con la opción que te resulte más cómoda y empezá a participar en tu organización de inmediato.
		</p>
	</CardContent>
	</div>
</Card>