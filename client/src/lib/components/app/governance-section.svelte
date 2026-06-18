<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Loader2, Vote, AlertCircle } from "@lucide/svelte";
	import { formatEther } from "viem";
	import { ProposalState } from "$lib/contracts/types";
	import { proposalStateName } from "$lib/contracts/read";
	import { voteOnProposal } from "$lib/contracts/write";
	import {
		getDashboardState,
		refreshAllOrgsDashboard,
		runAction
	} from "$lib/stores/dashboard.svelte";

	const dashboard = getDashboardState();

	function stateVariant(state: ProposalState) {
		switch (state) {
			case ProposalState.Approved:
				return "default" as const;
			case ProposalState.Rejected:
				return "destructive" as const;
			case ProposalState.Executed:
				return "secondary" as const;
			default:
				return "outline" as const;
		}
	}

	async function vote(orgSlug: string, proposalId: bigint, support: boolean) {
		const entry = dashboard.allOrgsData.find((item) => item.org.slug === orgSlug);
		if (!entry) return;

		await runAction(
			`vote-${orgSlug}-${proposalId}-${support}`,
			() => voteOnProposal(proposalId, support, entry.org),
			() => refreshAllOrgsDashboard(entry.userStatus.address)
		);
	}
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-xl">
			<Vote class="text-primary size-5" />
			Gobernanza
		</CardTitle>
		<CardDescription>
			Votá propuestas de las organizaciones donde sos miembro y estás al día.
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-6">
		{#if dashboard.hasPendingDebt}
			<div class="border-amber-500/30 bg-amber-500/5 flex items-start gap-3 rounded-xl border p-4">
				<AlertCircle class="mt-0.5 size-5 shrink-0 text-amber-600" />
				<p class="text-sm">
					Pagá tus contribuciones pendientes para poder votar en las propuestas.
				</p>
			</div>
		{/if}

		{#if dashboard.allOrgsData.length === 0}
			<p class="text-muted-foreground text-sm">
				No pertenecés a ninguna organización registrada con esta billetera.
			</p>
		{:else}
			{#each dashboard.allOrgsData as entry (entry.org.slug)}
				{@const pendingProposals = entry.proposals.filter(
					(proposal) => proposal.state === ProposalState.Pending
				)}
				<div class="space-y-3">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<h3 class="font-semibold">{entry.org.name}</h3>
						{#if entry.userStatus.canVote}
							<Badge variant="secondary">Podés votar</Badge>
						{:else if entry.userStatus.isMember}
							<Badge variant="outline">Sin derecho a voto</Badge>
						{/if}
					</div>

					{#if pendingProposals.length === 0}
						<p class="text-muted-foreground text-sm">No hay propuestas abiertas para votar.</p>
					{:else}
						{#each pendingProposals as proposal (proposal.id)}
							{@const voted = entry.votes[proposal.id.toString()]}
							{@const canVote = entry.userStatus.canVote && !voted}
							<div class="border-border/80 rounded-xl border p-4">
								<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
									<span class="font-medium">#{proposal.id.toString()}</span>
									<Badge variant={stateVariant(proposal.state)}>
										{proposalStateName(proposal.state)}
									</Badge>
								</div>
								<p class="text-muted-foreground mb-3 text-sm">{proposal.description}</p>
								<p class="text-muted-foreground mb-3 text-xs">
									Monto: <strong class="text-foreground">{formatEther(proposal.amount)} ETH</strong>
									· A favor: {proposal.forVotes.toString()} · En contra: {proposal.againstVotes.toString()}
								</p>

								{#if canVote}
									<div class="flex flex-wrap gap-2">
										<Button
											size="sm"
											disabled={dashboard.actionLoading === `vote-${entry.org.slug}-${proposal.id}-true`}
											onclick={() => vote(entry.org.slug, proposal.id, true)}
										>
											{#if dashboard.actionLoading === `vote-${entry.org.slug}-${proposal.id}-true`}
												<Loader2 class="size-3.5 animate-spin" />
											{/if}
											Votar a favor
										</Button>
										<Button
											size="sm"
											variant="outline"
											disabled={dashboard.actionLoading === `vote-${entry.org.slug}-${proposal.id}-false`}
											onclick={() => vote(entry.org.slug, proposal.id, false)}
										>
											{#if dashboard.actionLoading === `vote-${entry.org.slug}-${proposal.id}-false`}
												<Loader2 class="size-3.5 animate-spin" />
											{/if}
											Votar en contra
										</Button>
									</div>
								{:else if voted}
									<Badge variant="secondary">Ya votaste</Badge>
								{:else if !entry.userStatus.canVote}
									<Badge variant="outline">Pagá tus contribuciones para votar</Badge>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			{/each}
		{/if}
	</CardContent>
</Card>