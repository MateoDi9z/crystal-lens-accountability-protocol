<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Building2, Crown, Users, ArrowRight } from "@lucide/svelte";
	import { appPaths } from "$lib/config/paths";
	import {
		getDashboardState,
		getDebtRemaining
	} from "$lib/stores/dashboard.svelte";

	const dashboard = getDashboardState();

	function isOwner(slug: string) {
		return dashboard.ownedOrgsData.some((entry) => entry.org.slug === slug);
	}

	function memberStatus(entry: (typeof dashboard.allOrgsData)[number]) {
		const debt = getDebtRemaining(entry.userStatus);
		if (debt > 0n) {
			return { label: "Aporte pendiente", variant: "destructive" as const };
		}
		if (entry.userStatus.canVote) {
			return { label: "Al día · Podés votar", variant: "secondary" as const };
		}
		return { label: "Al día", variant: "outline" as const };
	}
</script>

<Card class="border-border/60 shadow-sm lg:sticky lg:top-24">
	<CardHeader class="pb-3">
		<CardTitle class="flex items-center gap-2 text-base">
			<Users class="text-primary size-4" />
			Mis organizaciones
		</CardTitle>
		<CardDescription class="text-xs">
			Organizaciones donde estás registrado como miembro.
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-2">
		{#if dashboard.loadingAllOrgs}
			{#each [1, 2] as item (item)}
				<div class="bg-muted/50 h-16 animate-pulse rounded-lg"></div>
			{/each}
		{:else if dashboard.allOrgsData.length === 0}
			<div class="text-muted-foreground rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-sm">
				<Building2 class="mx-auto mb-2 size-6 opacity-40" />
				<p>No pertenecés a ninguna organización con esta billetera.</p>
			</div>
		{:else}
			{#each dashboard.allOrgsData as entry (entry.org.slug)}
				{@const status = memberStatus(entry)}
				{@const owner = isOwner(entry.org.slug)}
				<div class="hover:bg-muted/40 flex items-center gap-3 rounded-lg border border-border/50 p-2.5 transition-colors">
					<div class="bg-muted size-10 shrink-0 overflow-hidden rounded-md">
						{#if entry.org.nftImage}
							<img
								src={entry.org.nftImage}
								alt=""
								class="size-full object-cover"
								loading="lazy"
							/>
						{:else}
							<div class="text-muted-foreground flex size-full items-center justify-center">
								<Building2 class="size-4 opacity-50" />
							</div>
						{/if}
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-1.5">
							<p class="truncate text-sm font-medium">{entry.org.name}</p>
							{#if owner}
								<Crown class="size-3 shrink-0 text-amber-600" title="Sos dueño" />
							{/if}
						</div>
						<Badge variant={status.variant} class="mt-1 h-5 px-1.5 text-[10px]">
							{status.label}
						</Badge>
					</div>

					<Button
						variant="ghost"
						size="icon-sm"
						class="shrink-0"
						href={owner ? appPaths.adminOrg(entry.org.slug) : appPaths.org(entry.org.slug)}
						title={owner ? "Administrar" : "Ver organización"}
					>
						<ArrowRight class="size-3.5" />
					</Button>
				</div>
			{/each}
		{/if}
	</CardContent>
</Card>