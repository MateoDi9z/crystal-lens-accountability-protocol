<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import OrgDiscoverCard from "$lib/components/app/org-discover-card.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>Discover — Crystal Lens</title>
	<meta
		name="description"
		content="Explorá organizaciones públicas con gobernanza transparente en Crystal Lens."
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
	<div class="mb-10">
		<Badge variant="secondary" class="mb-3">Público</Badge>
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Organizaciones</h1>
		<p class="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
			Explorá organizaciones con tesorería y gobernanza on-chain. No necesitás conectar tu billetera
			para ver la información.
		</p>
	</div>

	{#if data.orgs.length === 0}
		<p class="text-muted-foreground text-sm">No hay organizaciones configuradas todavía.</p>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.orgs as org (org.slug)}
				<OrgDiscoverCard {org} />
			{/each}
		</div>
	{/if}
</div>