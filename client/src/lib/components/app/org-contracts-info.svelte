<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { CircleHelp, Copy, Check, ExternalLink, Loader2 } from "@lucide/svelte";
	import type { OrgConfig } from "$lib/config/orgs";
	import { resolveOrgAddresses, type ResolvedOrgAddresses } from "$lib/contracts/read";
	import type { Address } from "viem";

	let { org }: { org: OrgConfig } = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let addresses = $state<ResolvedOrgAddresses | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let copiedField = $state<string | null>(null);

	const contractRows = $derived([
		{ key: "governance", label: "Governance", description: "Propuestas y votaciones" },
		{ key: "treasury", label: "Treasury", description: "Fondos y aportes" },
		{ key: "membership", label: "Membership", description: "Miembros y credenciales" }
	] as const);

	function etherscanUrl(address: Address) {
		return `https://sepolia.etherscan.io/address/${address}`;
	}

	async function openModal() {
		error = null;
		dialog?.showModal();

		if (addresses || loading) return;

		loading = true;
		try {
			addresses = await resolveOrgAddresses(org);
		} catch (err) {
			error =
				err instanceof Error
					? err.message
					: "No pudimos cargar las direcciones de los contratos.";
		} finally {
			loading = false;
		}
	}

	function closeModal() {
		dialog?.close();
	}

	async function copyAddress(field: string, address: Address) {
		try {
			await navigator.clipboard.writeText(address);
			copiedField = field;
			setTimeout(() => {
				if (copiedField === field) copiedField = null;
			}, 2000);
		} catch {
			// Ignore clipboard failures
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialog) closeModal();
	}
</script>

<Button
	variant="ghost"
	size="icon-xs"
	class="text-muted-foreground hover:text-foreground size-5 shrink-0"
	title="Ver contratos on-chain"
	aria-label="Ver direcciones de contratos"
	onclick={openModal}
>
	<CircleHelp class="size-3.5" />
</Button>

<dialog
	bind:this={dialog}
	class="bg-background text-foreground m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border/60 p-0 shadow-xl backdrop:bg-black/50 open:animate-in open:fade-in-0"
	onclick={handleBackdropClick}
	oncancel={(event) => {
		event.preventDefault();
		closeModal();
	}}
>
	<div class="border-border/60 border-b px-5 py-4">
		<h2 class="text-base font-semibold">Contratos on-chain</h2>
		<p class="text-muted-foreground mt-1 text-sm">
			Direcciones de los contratos de <strong class="text-foreground">{org.name}</strong> en Sepolia.
		</p>
	</div>

	<div class="space-y-3 px-5 py-4">
		{#if loading}
			<div class="text-muted-foreground flex items-center gap-2 py-6 text-sm">
				<Loader2 class="size-4 animate-spin" />
				Cargando direcciones…
			</div>
		{:else if error}
			<p class="text-destructive text-sm">{error}</p>
		{:else if addresses}
			{#each contractRows as row (row.key)}
				{@const address = addresses[row.key]}
				<div class="bg-muted/40 rounded-lg border border-border/50 p-3">
					<div class="mb-1 flex items-center justify-between gap-2">
						<p class="text-sm font-medium">{row.label}</p>
						<span class="text-muted-foreground text-xs">{row.description}</span>
					</div>
					<p class="font-mono text-xs break-all">{address}</p>
					<div class="mt-2 flex gap-1">
						<Button
							variant="outline"
							size="xs"
							class="h-7 gap-1"
							onclick={() => copyAddress(row.key, address)}
						>
							{#if copiedField === row.key}
								<Check class="size-3" />
								Copiado
							{:else}
								<Copy class="size-3" />
								Copiar
							{/if}
						</Button>
						<Button
							variant="ghost"
							size="xs"
							class="h-7 gap-1"
							href={etherscanUrl(address)}
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink class="size-3" />
							Etherscan
						</Button>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<div class="border-border/60 flex justify-end border-t px-5 py-3">
		<Button variant="outline" size="sm" onclick={closeModal}>Cerrar</Button>
	</div>
</dialog>