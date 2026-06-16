<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Users } from "@lucide/svelte";
	import { formatEther } from "viem";
	import type { Member } from "$lib/contracts/types";
	import type { Address } from "viem";

	let { members }: { members: Member[] } = $props();

	function short(addr: Address) {
		return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
	}

	function debtStatus(member: Member) {
		if (!member.isContributor) return { label: "No debt", variant: "outline" as const };
		if (member.isUpToDate) return { label: "Up to date", variant: "secondary" as const };
		return { label: "Debt pending", variant: "destructive" as const };
	}
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-lg">
			<Users class="text-primary size-5" />
			Members
		</CardTitle>
		<CardDescription>Registered members with contribution status.</CardDescription>
	</CardHeader>
	<CardContent>
		{#if members.length === 0}
			<p class="text-muted-foreground text-sm">No members registered.</p>
		{:else}
			<div class="divide-border/80 divide-y rounded-xl border">
				{#each members as member (member.address)}
					{@const status = debtStatus(member)}
					<div class="flex flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="font-medium">{member.data?.fullName ?? "Unknown"}</p>
							<p class="text-muted-foreground font-mono text-xs">{short(member.address)}</p>
						</div>
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="text-muted-foreground">DNI {member.data?.dni ?? "—"}</span>
							<span class="text-muted-foreground">· Token #{member.tokenId.toString()}</span>
							{#if member.isContributor}
								<span class="text-muted-foreground">
									· Paid {formatEther(member.totalPaid)} / Pending {formatEther(member.pendingContribution)} ETH
								</span>
							{/if}
							<Badge variant={status.variant}>{status.label}</Badge>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>