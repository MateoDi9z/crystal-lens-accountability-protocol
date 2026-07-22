<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import AddressDisplay from "$lib/components/app/address-display.svelte";
	import { Users } from "@lucide/svelte";
	import { formatEther } from "viem";
	import type { Member } from "$lib/contracts/types";

	let { members }: { members: Member[] } = $props();

	function debtStatus(member: Member) {
		if (!member.isContributor) return { label: "Sin contribución asignada", variant: "outline" as const };
		if (member.isUpToDate) return { label: "Al día", variant: "secondary" as const };
		return { label: "Aporte pendiente", variant: "destructive" as const };
	}
</script>

<Card class="border-border/50 shadow-md">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-xl font-bold">
			<Users class="text-primary size-5" />
			Miembros de la Organización
		</CardTitle>
		<CardDescription>Lista de miembros registrados y estado de sus aportes en blockchain.</CardDescription>
	</CardHeader>
	<CardContent>
		{#if members.length === 0}
			<p class="text-muted-foreground text-sm py-4">No hay miembros registrados.</p>
		{:else}
			<div class="divide-border/50 divide-y rounded-xl border border-border/50 overflow-hidden bg-card/30">
				{#each members as member (member.address)}
					{@const status = debtStatus(member)}
					<div class="flex flex-col gap-3 p-4 text-sm sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors">
						<div class="space-y-1">
							<p class="font-semibold text-foreground">{member.data?.fullName ?? "Sin nombre"}</p>
							<AddressDisplay address={member.address} truncate class="text-muted-foreground text-xs" />
						</div>
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">DNI {member.data?.dni ?? "—"}</span>
							<span class="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">NFT #{member.tokenId.toString()}</span>
							{#if member.isContributor}
								<span class="text-muted-foreground font-medium">
									Aportado: <strong class="text-emerald-600 dark:text-emerald-400">{formatEther(member.totalPaid)} ETH</strong> / Pendiente: <strong class="text-foreground">{formatEther(member.pendingContribution)} ETH</strong>
								</span>
							{/if}
							<Badge variant={status.variant} class="shadow-sm">{status.label}</Badge>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>