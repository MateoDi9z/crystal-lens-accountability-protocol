<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Banknote, Landmark, Wallet, X, ArrowRight } from "@lucide/svelte";
	import { formatEther } from "viem";
	import AddressDisplay from "$lib/components/app/address-display.svelte";
	import type { OrgConfig } from "$lib/config/orgs";
	import { getDashboardState } from "$lib/stores/dashboard.svelte";

	let {
		org,
		amount,
		open = $bindable(false),
		onconfirm
	}: {
		org: OrgConfig;
		amount: bigint;
		open: boolean;
		onconfirm: () => void;
	} = $props();

	const dashboard = getDashboardState();
	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (open) {
			dialog?.showModal();
		} else {
			dialog?.close();
		}
	});

	function handleClose() {
		open = false;
	}

	function handleConfirm() {
		open = false;
		onconfirm();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialog) {
			handleClose();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="bg-background text-foreground m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-primary/30 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-md open:animate-in open:fade-in-0 open:zoom-in-95"
	onclick={handleBackdropClick}
	oncancel={(event) => {
		event.preventDefault();
		handleClose();
	}}
>
	<div class="relative p-6">
		<button
			type="button"
			class="text-muted-foreground hover:text-foreground absolute right-4 top-4 rounded-md p-1 transition-colors"
			onclick={handleClose}
			aria-label="Cerrar"
		>
			<X class="size-4" />
		</button>

		<div class="mb-4 flex items-center gap-2">
			<div class="bg-primary/10 text-primary rounded-xl p-2.5">
				<Banknote class="size-6" />
			</div>
			<div>
				<h3 class="text-lg font-bold tracking-tight">Confirmar Aporte</h3>
				<p class="text-muted-foreground text-xs">{org.name}</p>
			</div>
		</div>

		<div class="bg-muted/30 border-border/50 my-5 rounded-2xl border p-5 space-y-3">
			<div class="flex items-center justify-between text-xs">
				<span class="text-muted-foreground font-semibold uppercase tracking-wider">Monto a pagar</span>
				<Badge variant="secondary">ETH</Badge>
			</div>
			<p class="text-3xl font-extrabold text-foreground tracking-tight">
				{formatEther(amount)} <span class="text-lg font-normal text-muted-foreground">ETH</span>
			</p>
		</div>

		<div class="space-y-2 text-xs text-muted-foreground mb-6">
			<div class="flex items-center justify-between py-1 border-b border-border/40">
				<span class="flex items-center gap-1.5"><Wallet class="size-3.5" /> Tu cuenta</span>
				{#if dashboard.address}
					<AddressDisplay address={dashboard.address} truncate class="font-mono text-foreground" />
				{/if}
			</div>
			<div class="flex items-center justify-between py-1">
				<span class="flex items-center gap-1.5"><Landmark class="size-3.5" /> Destino</span>
				<span class="font-medium text-foreground">Tesorería de {org.name}</span>
			</div>
		</div>

		<div class="flex flex-col sm:flex-row gap-2 justify-end">
			<Button variant="outline" class="w-full sm:w-auto" onclick={handleClose}>
				Cancelar
			</Button>
			<Button
				variant="default"
				class="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 font-semibold shadow-md"
				onclick={handleConfirm}
			>
				Confirmar y pagar
				<ArrowRight class="size-4" />
			</Button>
		</div>
	</div>
</dialog>
