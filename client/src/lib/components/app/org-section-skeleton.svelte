<script lang="ts">
	import { Card, CardContent, CardHeader } from "$lib/components/ui/card/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";

	let {
		variant = "default"
	}: {
		variant?: "treasury" | "members" | "proposals" | "default";
	} = $props();
</script>

<Card>
	<CardHeader class="space-y-2">
		<Skeleton class="h-6 w-32" />
		{#if variant !== "treasury"}
			<Skeleton class="h-4 w-64" />
		{/if}
	</CardHeader>
	<CardContent>
		{#if variant === "treasury"}
			<div class="grid gap-4 sm:grid-cols-2">
				{#each [1, 2, 3, 4] as item (item)}
					<div class="bg-muted/50 rounded-xl p-4">
						<Skeleton class="mb-2 h-3 w-24" />
						<Skeleton class="h-8 w-28" />
					</div>
				{/each}
			</div>
		{:else if variant === "members"}
			<div class="space-y-3">
				{#each [1, 2, 3, 4] as item (item)}
					<div class="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
						<div class="space-y-2">
							<Skeleton class="h-4 w-36" />
							<Skeleton class="h-3 w-24" />
						</div>
						<Skeleton class="h-6 w-20 rounded-full" />
					</div>
				{/each}
			</div>
		{:else}
			<div class="space-y-4">
				{#each [1, 2] as item (item)}
					<div class="rounded-xl border border-border/50 p-5">
						<Skeleton class="mb-3 h-4 w-28" />
						<Skeleton class="mb-2 h-4 w-full" />
						<Skeleton class="h-4 w-2/3" />
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>