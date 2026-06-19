<script lang="ts">
	import { onMount } from "svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import ConnectPrompt from "$lib/components/app/connect-prompt.svelte";
	import NetworkWarning from "$lib/components/app/network-warning.svelte";
	import OwnerOrgCard from "$lib/components/app/owner-org-card.svelte";
	import { Card, CardContent } from "$lib/components/ui/card/index.js";
	import { Crown, Building2 } from "@lucide/svelte";
	import {
		getDashboardState,
		refreshAllOrgsDashboard
	} from "$lib/stores/dashboard.svelte";

	const dashboard = getDashboardState();

	onMount(() => {
		if (dashboard.address) {
			refreshAllOrgsDashboard(dashboard.address);
		}
	});
</script>

<svelte:head>
	<title>Administración — Crystal Lens</title>
	<meta
		name="description"
		content="Gestioná las organizaciones de las que sos dueño en Crystal Lens."
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
	<div class="mb-10">
		<Badge variant="secondary" class="mb-3 gap-1">
			<Crown class="size-3" />
			Dueño
		</Badge>
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Mis organizaciones</h1>
		<p class="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
			Administrá miembros, propuestas y fondos de las organizaciones que liderás.
		</p>
	</div>

	{#if !dashboard.isConnected}
		<ConnectPrompt />
	{:else}
		{#if dashboard.isWrongNetwork}
			<div class="mb-6">
				<NetworkWarning />
			</div>
		{/if}

		{#if dashboard.loadingAllOrgs}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each [1, 2, 3] as item (item)}
					<div class="bg-muted/50 aspect-[3/4] animate-pulse rounded-xl"></div>
				{/each}
			</div>
		{:else if dashboard.ownedOrgsData.length === 0}
			<Card>
				<CardContent class="flex flex-col items-center gap-4 py-16 text-center">
					<div class="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
						<Building2 class="size-7 opacity-60" />
					</div>
					<div>
						<p class="font-medium">No administrás ninguna organización</p>
						<p class="text-muted-foreground mt-1 max-w-md text-sm">
							Con esta billetera no sos dueño de ninguna organización registrada. Si creaste una,
							verificá que estés conectado con la cuenta correcta.
						</p>
					</div>
				</CardContent>
			</Card>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each dashboard.ownedOrgsData as owned (owned.org.slug)}
					<OwnerOrgCard {owned} />
				{/each}
			</div>
		{/if}
	{/if}
</div>