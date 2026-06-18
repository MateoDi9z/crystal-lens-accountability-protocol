<script lang="ts">
	import { page } from "$app/state";
	import { getOrg } from "$lib/config/orgs";
	import { getTreasuryOverview, getMembers, getProposals } from "$lib/contracts/read";
	import TreasuryCard from "$lib/components/app/treasury-card.svelte";
	import MembersList from "$lib/components/app/members-list.svelte";
	import ProposalsList from "$lib/components/app/proposals-list.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Loader2, ArrowLeft, AlertCircle } from "@lucide/svelte";
	import type { TreasuryOverview, Member, Proposal } from "$lib/contracts/types";

	const slug = $derived(page.params.slug ?? "");
	const org = $derived(slug ? getOrg(slug) : undefined);

	let loading = $state(true);
	let loadError = $state<string | null>(null);
	let treasury = $state<TreasuryOverview | null>(null);
	let members = $state<Member[]>([]);
	let proposals = $state<Proposal[]>([]);

	$effect(() => {
		const currentOrg = org;
		if (!currentOrg) {
			loading = false;
			loadError = "Organización no encontrada.";
			treasury = null;
			members = [];
			proposals = [];
			return;
		}

		let cancelled = false;
		loading = true;
		loadError = null;

		Promise.allSettled([
			getTreasuryOverview(currentOrg),
			getMembers(currentOrg),
			getProposals(currentOrg)
		])
			.then((results) => {
				if (cancelled) return;

				const errors: string[] = [];

				if (results[0].status === "fulfilled") {
					treasury = results[0].value;
				} else {
					console.error("Error loading treasury:", results[0].reason);
					errors.push("tesorería");
				}

				if (results[1].status === "fulfilled") {
					members = results[1].value;
				} else {
					console.error("Error loading members:", results[1].reason);
					errors.push("miembros");
				}

				if (results[2].status === "fulfilled") {
					proposals = results[2].value;
				} else {
					console.error("Error loading proposals:", results[2].reason);
					errors.push("propuestas");
				}

				if (!treasury && errors.length > 0) {
					const firstError = results.find((result) => result.status === "rejected");
					loadError =
						firstError?.status === "rejected" && firstError.reason instanceof Error
							? firstError.reason.message
							: `No se pudo cargar: ${errors.join(", ")}.`;
				} else if (errors.length > 0) {
					loadError = `Algunos datos no se pudieron cargar: ${errors.join(", ")}.`;
				}
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});

		return () => {
			cancelled = true;
		};
	});
</script>

<svelte:head>
	<title>{org ? `${org.name} — Crystal Lens` : "Organización — Crystal Lens"}</title>
	<meta
		name="description"
		content={org?.description ?? "Vista pública de una organización en Crystal Lens."}
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
	<Button variant="ghost" size="sm" href="/discover" class="mb-6 gap-1.5">
		<ArrowLeft class="size-4" />
		Volver a Discover
	</Button>

	{#if !org}
		<div class="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4">
			<AlertCircle class="text-destructive mt-0.5 size-5 shrink-0" />
			<div>
				<p class="font-medium">Organización no encontrada</p>
				<p class="text-muted-foreground mt-1 text-sm">
					El enlace no corresponde a ninguna organización configurada.
				</p>
			</div>
		</div>
	{:else}
		<div class="mb-8">
			<Badge variant="secondary" class="mb-3">Vista pública</Badge>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{org.name}</h1>
			<p class="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed sm:text-base">
				{org.description}
			</p>
		</div>

		{#if loading}
			<div class="text-muted-foreground flex items-center gap-2 py-16 text-sm">
				<Loader2 class="size-4 animate-spin" />
				Cargando datos on-chain…
			</div>
		{:else if loadError && !treasury}
			<div class="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4">
				<AlertCircle class="text-destructive mt-0.5 size-5 shrink-0" />
				<div>
					<p class="font-medium">Error al cargar</p>
					<p class="text-muted-foreground mt-1 text-sm">{loadError}</p>
				</div>
			</div>
		{:else}
			{#if loadError}
				<div class="border-amber-500/30 bg-amber-500/5 mb-6 flex items-start gap-3 rounded-xl border p-4">
					<AlertCircle class="mt-0.5 size-5 shrink-0 text-amber-600" />
					<p class="text-muted-foreground text-sm">{loadError}</p>
				</div>
			{/if}
			<div class="space-y-6">
				{#if treasury}
					<TreasuryCard {treasury} />
				{/if}
				<MembersList {members} />
				<ProposalsList {proposals} votes={{}} readonly />
			</div>
		{/if}
	{/if}
</div>