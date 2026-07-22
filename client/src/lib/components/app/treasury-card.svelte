<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import AddressDisplay from "$lib/components/app/address-display.svelte";
	import { Banknote, Users, Landmark, Shield } from "@lucide/svelte";
	import { formatEther } from "viem";
	import type { TreasuryOverview } from "$lib/contracts/types";

	let { treasury }: { treasury: TreasuryOverview } = $props();
</script>

<Card class="border-border/50 shadow-md">
	<CardHeader>
		<div class="flex items-center justify-between gap-2">
			<CardTitle class="flex items-center gap-2 text-xl font-bold">
				<Landmark class="text-primary size-5" />
				Estado de Tesorería
			</CardTitle>
			<Badge variant="secondary">On-chain</Badge>
		</div>
	</CardHeader>
	<CardContent class="grid gap-4 sm:grid-cols-2">
		<div class="bg-muted/30 border border-border/50 rounded-xl p-4">
			<div class="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
				<Banknote class="size-3.5 text-primary" /> Fondos Totales
			</div>
			<p class="text-2xl font-bold text-foreground">{formatEther(treasury.totalFunds)} ETH</p>
		</div>
		<div class="bg-muted/30 border border-border/50 rounded-xl p-4">
			<div class="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
				<Shield class="size-3.5 text-primary" /> Balance en Contrato
			</div>
			<p class="text-2xl font-bold text-foreground">{formatEther(treasury.balance)} ETH</p>
		</div>
		<div class="bg-muted/30 border border-border/50 rounded-xl p-4">
			<div class="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
				<Users class="size-3.5 text-primary" /> Contribuyentes
			</div>
			<p class="text-2xl font-bold text-foreground">{treasury.contributorCount.toString()}</p>
		</div>
		<div class="bg-muted/30 border border-border/50 rounded-xl p-4 text-sm space-y-2">
			<div>
				<p class="text-muted-foreground mb-0.5 text-xs font-semibold uppercase tracking-wide">Gobernanza</p>
				<AddressDisplay address={treasury.governance} truncate class="text-sm" />
			</div>
			<div>
				<p class="text-muted-foreground mb-0.5 text-xs font-semibold uppercase tracking-wide">Propietario / Dueño</p>
				<AddressDisplay address={treasury.owner} truncate class="text-sm" />
			</div>
		</div>
	</CardContent>
</Card>