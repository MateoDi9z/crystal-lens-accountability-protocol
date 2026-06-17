<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Loader2, Vote } from "@lucide/svelte";
	import { formatEther } from "viem";
	import { ProposalState, type Proposal, type UserStatus } from "$lib/contracts/types";
	import { proposalStateName } from "$lib/contracts/read";
	import { executeProposal, voteOnProposal } from "$lib/contracts/write";
	import { refreshDashboard, runAction, getDashboardState } from "$lib/stores/dashboard.svelte";

	let {
		proposals,
		user,
		votes
	}: {
		proposals: Proposal[];
		user?: UserStatus;
		votes: Record<string, boolean>;
	} = $props();

	const dashboard = getDashboardState();

	function stateVariant(state: Proposal["state"]) {
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

	async function vote(id: bigint, support: boolean) {
		if (!user) return;
		await runAction(
			`vote-${id}-${support}`,
			() => voteOnProposal(id, support),
			() => refreshDashboard(user.address)
		);
	}

	async function execute(id: bigint) {
		await runAction(`execute-${id}`, () => executeProposal(id), () =>
			user ? refreshDashboard(user.address) : refreshDashboard()
		);
	}
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-lg">
			<Vote class="text-primary size-5" />
			Proposals
		</CardTitle>
		<CardDescription>Governance proposals read directly from the contract.</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		{#if proposals.length === 0}
			<p class="text-muted-foreground text-sm">No proposals yet.</p>
		{:else}
			{#each proposals as proposal (proposal.id)}
				{@const voted = votes[proposal.id.toString()]}
				{@const canVote =
					user?.canVote &&
					proposal.state === ProposalState.Pending &&
					!voted}
				<div class="border-border/80 rounded-xl border p-4">
					<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
						<h3 class="font-semibold">#{proposal.id.toString()}</h3>
						<Badge variant={stateVariant(proposal.state)}>{proposalStateName(proposal.state)}</Badge>
					</div>
					<p class="text-muted-foreground mb-3 text-sm leading-relaxed">{proposal.description}</p>
					<div class="text-muted-foreground mb-4 flex flex-wrap gap-4 text-xs">
						<span>Amount: <strong class="text-foreground">{formatEther(proposal.amount)} ETH</strong></span>
						<span>For: <strong class="text-foreground">{proposal.forVotes.toString()}</strong></span>
						<span>Against: <strong class="text-foreground">{proposal.againstVotes.toString()}</strong></span>
					</div>

					<div class="flex flex-wrap gap-2">
						{#if canVote}
							<Button
								size="sm"
								disabled={dashboard.actionLoading === `vote-${proposal.id}-true`}
								onclick={() => vote(proposal.id, true)}
							>
								{#if dashboard.actionLoading === `vote-${proposal.id}-true`}
									<Loader2 class="size-3.5 animate-spin" />
								{/if}
								Vote For
							</Button>
							<Button
								size="sm"
								variant="outline"
								disabled={dashboard.actionLoading === `vote-${proposal.id}-false`}
								onclick={() => vote(proposal.id, false)}
							>
								{#if dashboard.actionLoading === `vote-${proposal.id}-false`}
									<Loader2 class="size-3.5 animate-spin" />
								{/if}
								Vote Against
							</Button>
						{:else if voted}
							<Badge variant="secondary">You already voted</Badge>
						{:else if user && proposal.state === ProposalState.Pending && !user.canVote}
							<Badge variant="outline">Not eligible to vote</Badge>
						{/if}

						{#if proposal.state === ProposalState.Approved}
							<Button
								size="sm"
								variant="secondary"
								disabled={dashboard.actionLoading === `execute-${proposal.id}`}
								onclick={() => execute(proposal.id)}
							>
								{#if dashboard.actionLoading === `execute-${proposal.id}`}
									<Loader2 class="size-3.5 animate-spin" />
								{/if}
								Execute
							</Button>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</CardContent>
</Card>