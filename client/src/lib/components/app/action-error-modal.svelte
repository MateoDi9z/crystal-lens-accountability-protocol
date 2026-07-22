<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { AlertTriangle, X } from "@lucide/svelte";
	import { getDashboardState } from "$lib/stores/dashboard.svelte";

	const dashboard = getDashboardState();
	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (dashboard.actionError) {
			dialog?.showModal();
		} else {
			dialog?.close();
		}
	});

	function handleClose() {
		dashboard.clearActionError();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialog) {
			handleClose();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="bg-background text-foreground m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-destructive/30 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm open:animate-in open:fade-in-0 open:zoom-in-95"
	onclick={handleBackdropClick}
	oncancel={(event) => {
		event.preventDefault();
		handleClose();
	}}
>
	{#if dashboard.actionError}
		<div class="relative p-6">
			<button
				type="button"
				class="text-muted-foreground hover:text-foreground absolute right-4 top-4 rounded-md p-1 transition-colors"
				onclick={handleClose}
				aria-label="Cerrar"
			>
				<X class="size-4" />
			</button>

			<div class="flex items-start gap-4">
				<div class="bg-destructive/15 text-destructive rounded-full p-3 shrink-0">
					<AlertTriangle class="size-6" />
				</div>
				<div class="space-y-1 pr-4">
					<h3 class="text-lg font-bold tracking-tight">
						{dashboard.actionError.title ?? "Atención"}
					</h3>
					<p class="text-muted-foreground text-sm leading-relaxed">
						{dashboard.actionError.message}
					</p>
				</div>
			</div>

			<div class="mt-6 flex justify-end">
				<Button variant="default" class="w-full sm:w-auto px-6 font-semibold" onclick={handleClose}>
					Entendido
				</Button>
			</div>
		</div>
	{/if}
</dialog>
