<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Receipt, ArrowRight, X, ShieldCheck } from "@lucide/svelte";
	import AddressDisplay from "$lib/components/app/address-display.svelte";
	import type { Address } from "viem";

	export interface TicketDetail {
		label: string;
		value: string;
		isAddress?: boolean;
	}

	let {
		open = $bindable(false),
		title = "Confirmar transacción",
		subtitle = "Verificá los detalles antes de firmar en tu billetera",
		targetLabel = "Dirección de destino",
		targetAddress = null as Address | string | null,
		amountEth = null as string | null,
		details = [] as TicketDetail[],
		confirmText = "Confirmar en billetera",
		onconfirm
	}: {
		open: boolean;
		title?: string;
		subtitle?: string;
		targetLabel?: string;
		targetAddress?: Address | string | null;
		amountEth?: string | null;
		details?: TicketDetail[];
		confirmText?: string;
		onconfirm: () => void;
	} = $props();

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
	class="bg-background text-foreground m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-border/60 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-md open:animate-in open:fade-in-0 open:zoom-in-95"
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

		<!-- Header -->
		<div class="mb-5 flex items-center gap-3">
			<div class="bg-primary/10 text-primary rounded-2xl p-3">
				<Receipt class="size-6" />
			</div>
			<div>
				<h3 class="text-xl font-bold tracking-tight">{title}</h3>
				<p class="text-muted-foreground text-xs">{subtitle}</p>
			</div>
		</div>

		<!-- Ticket Checkout Box -->
		<div class="bg-card/70 border-border/60 relative overflow-hidden rounded-2xl border p-5 shadow-inner space-y-4">
			<div class="absolute -left-3 top-1/2 size-6 rounded-full bg-background border-r border-border/60"></div>
			<div class="absolute -right-3 top-1/2 size-6 rounded-full bg-background border-l border-border/60"></div>

			{#if amountEth}
				<div class="text-center pb-3 border-b border-dashed border-border/60">
					<span class="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Monto de la Operación</span>
					<div class="mt-1 flex items-baseline justify-center gap-1.5">
						<span class="text-3xl font-extrabold text-foreground tracking-tight">{amountEth}</span>
						<span class="text-base font-semibold text-primary">ETH</span>
					</div>
				</div>
			{/if}

			{#if targetAddress}
				<div class="space-y-1">
					<span class="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{targetLabel}</span>
					<div class="bg-muted/40 rounded-xl border border-border/40 p-2.5">
						<AddressDisplay address={targetAddress} truncate class="text-sm font-mono text-foreground" />
					</div>
				</div>
			{/if}

			{#if details.length > 0}
				<div class="space-y-2 text-xs pt-1 border-t border-dashed border-border/60">
					{#each details as item}
						<div class="flex items-center justify-between gap-2 py-0.5">
							<span class="text-muted-foreground font-medium">{item.label}:</span>
							{#if item.isAddress}
								<AddressDisplay address={item.value} truncate class="font-mono text-foreground" />
							{:else}
								<span class="font-semibold text-foreground truncate max-w-[200px] text-right">{item.value}</span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-2">
				<ShieldCheck class="size-3.5 text-emerald-500" />
				<span>Verificado On-Chain</span>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
			<Button variant="outline" class="w-full sm:w-auto" onclick={handleClose}>
				Cancelar
			</Button>
			<Button
				variant="default"
				class="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 font-semibold shadow-md"
				onclick={handleConfirm}
			>
				{confirmText}
				<ArrowRight class="size-4" />
			</Button>
		</div>
	</div>
</dialog>
