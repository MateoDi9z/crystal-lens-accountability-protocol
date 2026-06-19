<script lang="ts">
	import { page } from "$app/state";
	import { getOrg } from "$lib/config/orgs";
	import { appPaths } from "$lib/config/paths";
	import { getTreasuryOverview, getMembers, getProposals } from "$lib/contracts/read";
	import TreasuryCard from "$lib/components/app/treasury-card.svelte";
	import MembersList from "$lib/components/app/members-list.svelte";
	import ProposalsList from "$lib/components/app/proposals-list.svelte";
	import OrgContractsInfo from "$lib/components/app/org-contracts-info.svelte";
	import OrgSectionSkeleton from "$lib/components/app/org-section-skeleton.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { ArrowLeft, AlertCircle } from "@lucide/svelte";
	import type { TreasuryOverview, Member, Proposal } from "$lib/contracts/types";

	const slug = $derived(page.params.slug ?? "");
	const org = $derived(slug ? getOrg(slug) : undefined);

	let treasury = $state<TreasuryOverview | null>(null);
	let members = $state<Member[]>([]);
	let proposals = $state<Proposal[]>([]);
	let treasuryLoading = $state(false);
	let membersLoading = $state(false);
	let proposalsLoading = $state(false);
	let treasuryError = $state<string | null>(null);
	let membersError = $state<string | null>(null);
	let proposalsError = $state<string | null>(null);

	$effect(() => {
		const currentOrg = org;
		if (!currentOrg) {
			treasury = null;
			members = [];
			proposals = [];
			treasuryLoading = false;
			membersLoading = false;
			proposalsLoading = false;
			treasuryError = null;
			membersError = null;
			proposalsError = null;
			return;
		}

		let cancelled = false;
		treasury = null;
		members = [];
		proposals = [];
		treasuryLoading = true;
		membersLoading = true;
		proposalsLoading = true;
		treasuryError = null;
		membersError = null;
		proposalsError = null;

		getTreasuryOverview(currentOrg)
			.then((value) => {
				if (!cancelled) treasury = value;
			})
			.catch((error) => {
				if (!cancelled) {
					treasuryError =
						error instanceof Error ? error.message : "No se pudo cargar la tesorería.";
				}
			})
			.finally(() => {
				if (!cancelled) treasuryLoading = false;
			});

		getMembers(currentOrg)
			.then((value) => {
				if (!cancelled) members = value;
			})
			.catch((error) => {
				if (!cancelled) {
					membersError = error instanceof Error ? error.message : "No se pudieron cargar los miembros.";
				}
			})
			.finally(() => {
				if (!cancelled) membersLoading = false;
			});

		getProposals(currentOrg)
			.then((value) => {
				if (!cancelled) proposals = value;
			})
			.catch((error) => {
				if (!cancelled) {
					proposalsError =
						error instanceof Error ? error.message : "No se pudieron cargar las propuestas.";
				}
			})
			.finally(() => {
				if (!cancelled) proposalsLoading = false;
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
	<Button variant="ghost" size="sm" href={appPaths.discover} class="mb-6 gap-1.5">
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
			<div class="flex items-center gap-2">
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{org.name}</h1>
				<OrgContractsInfo {org} />
			</div>
			<p class="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed sm:text-base">
				{org.description}
			</p>
		</div>

		<div class="space-y-6">
			{#if treasuryLoading}
				<OrgSectionSkeleton variant="treasury" />
			{:else if treasuryError}
				<div class="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4">
					<AlertCircle class="text-destructive mt-0.5 size-5 shrink-0" />
					<p class="text-muted-foreground text-sm">{treasuryError}</p>
				</div>
			{:else if treasury}
				<TreasuryCard {treasury} />
			{/if}

			{#if membersLoading}
				<OrgSectionSkeleton variant="members" />
			{:else if membersError}
				<div class="border-amber-500/30 bg-amber-500/5 flex items-start gap-3 rounded-xl border p-4">
					<AlertCircle class="mt-0.5 size-5 shrink-0 text-amber-600" />
					<p class="text-muted-foreground text-sm">{membersError}</p>
				</div>
			{:else}
				<MembersList {members} />
			{/if}

			{#if proposalsLoading}
				<OrgSectionSkeleton variant="proposals" />
			{:else if proposalsError}
				<div class="border-amber-500/30 bg-amber-500/5 flex items-start gap-3 rounded-xl border p-4">
					<AlertCircle class="mt-0.5 size-5 shrink-0 text-amber-600" />
					<p class="text-muted-foreground text-sm">{proposalsError}</p>
				</div>
			{:else}
				<ProposalsList {proposals} votes={{}} readonly />
			{/if}
		</div>
	{/if}
</div>