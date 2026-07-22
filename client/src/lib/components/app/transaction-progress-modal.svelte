<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Wallet, Loader2, CheckCircle2, AlertTriangle, X, Sparkles } from "@lucide/svelte";
	import { getDashboardState } from "$lib/stores/dashboard.svelte";

	const dashboard = getDashboardState();
	let dialog = $state<HTMLDialogElement | null>(null);

	const tx = $derived(dashboard.txStatus);

	$effect(() => {
		if (tx && tx.phase !== "idle") {
			dialog?.showModal();
		} else {
			dialog?.close();
		}
	});

	function handleClose() {
		dashboard.clearTxStatus();
	}

	function handleBackdropClick(event: MouseEvent) {
		// Se permite cerrar solo si la transacción terminó o falló
		if (event.target === dialog && (tx?.phase === "success" || tx?.phase === "error")) {
			handleClose();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="bg-background text-foreground m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border/60 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-md open:animate-in open:fade-in-0 open:zoom-in-95"
	onclick={handleBackdropClick}
	oncancel={(event) => {
		event.preventDefault();
		if (tx?.phase === "success" || tx?.phase === "error") {
			handleClose();
		}
	}}
>
	{#if tx && tx.phase !== "idle"}
		<div class="relative p-6">
			{#if tx.phase === "success" || tx.phase === "error"}
				<button
					type="button"
					class="text-muted-foreground hover:text-foreground absolute right-4 top-4 rounded-md p-1 transition-colors"
					onclick={handleClose}
					aria-label="Cerrar"
				>
					<X class="size-4" />
				</button>
			{/if}

			<!-- Stepper de Etapas -->
			<div class="mb-6 flex items-center justify-between border-b border-border/50 pb-4 text-xs font-semibold">
				<div class="flex items-center gap-1.5 {tx.phase === 'wallet' ? 'text-primary' : 'text-muted-foreground'}">
					<div class="flex size-5 items-center justify-center rounded-full border {tx.phase === 'wallet' ? 'border-primary bg-primary/10' : 'border-border'}">
						1
					</div>
					<span>Firma</span>
				</div>
				<div class="h-0.5 w-6 bg-border/60"></div>
				<div class="flex items-center gap-1.5 {tx.phase === 'processing' ? 'text-primary' : 'text-muted-foreground'}">
					<div class="flex size-5 items-center justify-center rounded-full border {tx.phase === 'processing' ? 'border-primary bg-primary/10' : 'border-border'}">
						2
					</div>
					<span>Blockchain</span>
				</div>
				<div class="h-0.5 w-6 bg-border/60"></div>
				<div class="flex items-center gap-1.5 {tx.phase === 'success' ? 'text-emerald-500' : tx.phase === 'error' ? 'text-destructive' : 'text-muted-foreground'}">
					<div class="flex size-5 items-center justify-center rounded-full border {tx.phase === 'success' ? 'border-emerald-500 bg-emerald-500/10' : tx.phase === 'error' ? 'border-destructive bg-destructive/10' : 'border-border'}">
						3
					</div>
					<span>Resultado</span>
				</div>
			</div>

			<!-- Contenido de la Etapa Actual -->
			<div class="flex flex-col items-center text-center space-y-4 py-2">
				{#if tx.phase === "wallet"}
					<div class="relative flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Wallet class="size-8 animate-bounce" />
						<div class="absolute -right-1 -top-1 rounded-full bg-background p-1 shadow-sm">
							<Loader2 class="size-4 animate-spin text-primary" />
						</div>
					</div>
					<div class="space-y-1">
						<h3 class="text-xl font-bold tracking-tight">{tx.title ?? "Confirmación en billetera"}</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">{tx.message ?? "Confirmá la transacción en tu billetera..."}</p>
					</div>
				{:else if tx.phase === "processing"}
					<div class="relative flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400">
						<Loader2 class="size-8 animate-spin" />
					</div>
					<div class="space-y-1">
						<h3 class="text-xl font-bold tracking-tight">{tx.title ?? "Procesando transacción"}</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">{tx.message ?? "Esperando confirmación en la blockchain..."}</p>
					</div>
				{:else if tx.phase === "success"}
					<div class="relative flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400">
						<CheckCircle2 class="size-8 animate-in zoom-in-50" />
						<Sparkles class="absolute -right-1 -top-1 size-5 text-amber-400 animate-pulse" />
					</div>
					<div class="space-y-1">
						<h3 class="text-xl font-bold tracking-tight text-foreground">{tx.title ?? "¡Transacción completada!"}</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">{tx.message ?? "La operación fue registrada exitosamente."}</p>
					</div>
				{:else if tx.phase === "error"}
					<div class="flex size-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
						<AlertTriangle class="size-8 animate-in zoom-in-50" />
					</div>
					<div class="space-y-1">
						<h3 class="text-xl font-bold tracking-tight text-destructive">{tx.title ?? "No se pudo realizar la transacción"}</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">{tx.message}</p>
					</div>
				{/if}
			</div>

			<!-- Botones de Acción -->
			{#if tx.phase === "success" || tx.phase === "error"}
				<div class="mt-6 flex justify-end">
					<Button
						variant={tx.phase === "success" ? "default" : "outline"}
						class="w-full font-semibold shadow-md"
						onclick={handleClose}
					>
						{tx.phase === "success" ? "Entendido, ¡genial!" : "Cerrar"}
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</dialog>
