<script lang="ts">
	import { Card, CardContent, CardHeader } from "$lib/components/ui/card/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<div class="space-y-6">
	<Card>
		<CardHeader class="space-y-2">
			<Skeleton class="h-7 w-56" />
			<Skeleton class="h-4 w-full max-w-md" />
		</CardHeader>
		<CardContent class="space-y-4">
			{#each [1, 2] as item (item)}
				<div class="border-border/50 rounded-2xl border p-6">
					<Skeleton class="mb-3 h-6 w-40" />
					<Skeleton class="mb-4 h-4 w-52" />
					<Skeleton class="h-9 w-28" />
				</div>
			{/each}
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="space-y-2">
			<Skeleton class="h-7 w-48" />
			<Skeleton class="h-4 w-full max-w-lg" />
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="rounded-2xl border border-border/50 p-5">
				<Skeleton class="mb-4 h-6 w-44" />
				<Skeleton class="mb-2 h-4 w-full" />
				<Skeleton class="mb-4 h-4 w-3/4" />
				<div class="flex gap-2">
					<Skeleton class="h-8 w-24" />
					<Skeleton class="h-8 w-28" />
				</div>
			</div>
		</CardContent>
	</Card>
</div>