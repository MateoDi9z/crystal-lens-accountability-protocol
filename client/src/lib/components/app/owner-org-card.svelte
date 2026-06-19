<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Building2, ArrowRight, Crown, Users } from "@lucide/svelte";
	import { appPaths } from "$lib/config/paths";
	import { ProposalState } from "$lib/contracts/types";
	import type { OwnedOrgData } from "$lib/stores/dashboard.svelte";

	let { owned }: { owned: OwnedOrgData } = $props();

	const approvedCount = $derived(
		owned.proposals.filter((proposal) => proposal.state === ProposalState.Approved).length
	);
	const pendingCount = $derived(
		owned.proposals.filter((proposal) => proposal.state === ProposalState.Pending).length
	);
</script>

<Card class="flex flex-col overflow-hidden pt-0 transition-shadow hover:shadow-md">
	<div class="bg-muted relative aspect-[4/3] w-full overflow-hidden">
		{#if owned.org.nftImage}
			<img
				src={owned.org.nftImage}
				alt="Imagen de {owned.org.name}"
				class="size-full object-cover"
				loading="lazy"
			/>
		{:else}
			<div class="text-muted-foreground flex size-full items-center justify-center">
				<Building2 class="size-12 opacity-40" />
			</div>
		{/if}
		<div class="absolute top-3 left-3">
			<Badge class="gap-1 bg-background/90 text-foreground shadow-sm backdrop-blur-sm">
				<Crown class="size-3" />
				Dueño
			</Badge>
		</div>
	</div>

	<CardHeader class="pb-2">
		<CardTitle class="text-lg">{owned.org.name}</CardTitle>
		<CardDescription class="line-clamp-2">{owned.org.description}</CardDescription>
	</CardHeader>

	<CardContent class="mt-auto space-y-4 pt-0">
		<div class="text-muted-foreground flex flex-wrap gap-3 text-xs">
			<span class="flex items-center gap-1">
				<Users class="size-3.5" />
				{owned.members.length} {owned.members.length === 1 ? "miembro" : "miembros"}
			</span>
			{#if pendingCount > 0}
				<span>{pendingCount} en votación</span>
			{/if}
			{#if approvedCount > 0}
				<span class="text-emerald-600 dark:text-emerald-400">
					{approvedCount} {approvedCount === 1 ? "lista para liberar" : "listas para liberar"}
				</span>
			{/if}
		</div>

		<Button href={appPaths.adminOrg(owned.org.slug)} class="w-full gap-2">
			Administrar
			<ArrowRight class="size-4" />
		</Button>
	</CardContent>
</Card>