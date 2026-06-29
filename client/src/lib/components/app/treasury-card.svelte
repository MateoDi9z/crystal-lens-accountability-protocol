<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import AddressDisplay from "$lib/components/app/address-display.svelte";
	import { Banknote, Users, Landmark, Shield } from "@lucide/svelte";
	import { formatEther } from "viem";
	import type { TreasuryOverview } from "$lib/contracts/types";

	let { treasury }: { treasury: TreasuryOverview } = $props();
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between gap-2">
			<CardTitle class="flex items-center gap-2 text-lg">
				<Landmark class="text-primary size-5" />
				Treasury
			</CardTitle>
			<Badge variant="secondary">On-chain</Badge>
		</div>
	</CardHeader>
	<CardContent class="grid gap-4 sm:grid-cols-2">
		<div class="bg-muted/50 rounded-xl p-4">
			<div class="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide">
				<Banknote class="size-3.5" /> Total funds
			</div>
			<p class="text-2xl font-bold">{formatEther(treasury.totalFunds)} ETH</p>
		</div>
		<div class="bg-muted/50 rounded-xl p-4">
			<div class="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide">
				<Shield class="size-3.5" /> Contract balance
			</div>
			<p class="text-2xl font-bold">{formatEther(treasury.balance)} ETH</p>
		</div>
		<div class="bg-muted/50 rounded-xl p-4">
			<div class="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide">
				<Users class="size-3.5" /> Contributors
			</div>
			<p class="text-2xl font-bold">{treasury.contributorCount.toString()}</p>
		</div>
		<div class="bg-muted/50 rounded-xl p-4 text-sm">
			<p class="text-muted-foreground mb-1 text-xs uppercase tracking-wide">Governance</p>
			<AddressDisplay address={treasury.governance} truncate class="text-sm" />
			<p class="text-muted-foreground mt-2 text-xs uppercase tracking-wide">Owner</p>
			<AddressDisplay address={treasury.owner} truncate class="text-sm" />
		</div>
	</CardContent>
</Card>