<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Building2, ArrowRight } from "@lucide/svelte";
	import { appPaths } from "$lib/config/paths";
	import type { OrgConfig } from "$lib/config/orgs";

	let { org }: { org: OrgConfig } = $props();
</script>

<Card class="flex flex-col overflow-hidden pt-0">
	<div class="bg-muted relative aspect-[4/3] w-full overflow-hidden">
		{#if org.nftImage}
			<img
				src={org.nftImage}
				alt="NFT de membresía de {org.name}"
				class="size-full object-cover"
				loading="lazy"
			/>
		{:else}
			<div class="text-muted-foreground flex size-full items-center justify-center">
				<Building2 class="size-12 opacity-40" />
			</div>
		{/if}
	</div>

	<CardHeader class="pb-2">
		<CardTitle class="text-lg">{org.name}</CardTitle>
		<CardDescription class="line-clamp-3">{org.description}</CardDescription>
	</CardHeader>

	<CardContent class="mt-auto pt-0">
		<Button href={appPaths.org(org.slug)} class="w-full gap-2">
			Ver organización
			<ArrowRight class="size-4" />
		</Button>
	</CardContent>
</Card>