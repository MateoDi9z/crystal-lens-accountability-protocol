<script lang="ts">
	import { getAllOrgs } from "$lib/config/orgs";
	import { appPaths } from "$lib/config/paths";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Building2, ArrowRight } from "@lucide/svelte";

	const orgs = getAllOrgs();
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

	{#if orgs.length === 0}
		<p class="text-muted-foreground text-sm">No hay organizaciones configuradas todavía.</p>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each orgs as org (org.slug)}
				<Card class="flex flex-col">
					<CardHeader>
						<CardTitle class="flex items-center gap-2 text-lg">
							<Building2 class="text-primary size-5" />
							{org.name}
						</CardTitle>
						<CardDescription class="line-clamp-3">{org.description}</CardDescription>
					</CardHeader>
					<CardContent class="mt-auto">
						<Button href={appPaths.org(org.slug)} class="w-full gap-2">
							Ver organización
							<ArrowRight class="size-4" />
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>