<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Loader2, CheckCircle2, AlertCircle, Banknote, Sparkles } from "@lucide/svelte";
	import { formatEther } from "viem";
	import { ProposalState, type Proposal } from "$lib/contracts/types";
	import { proposalStateName } from "$lib/contracts/read";
	import type { OrgConfig } from "$lib/config/orgs";
	import {
		getDashboardState,
		runReleaseFunds,
		clearReleaseFundsFeedback
	} from "$lib/stores/dashboard.svelte";

	let { org, proposals }: { org: OrgConfig; proposals: Proposal[] } = $props();

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

	function feedbackKey(proposalId: bigint) {
		return `${org.slug}-${proposalId.toString()}`;
	}

	function releaseFunds(proposalId: bigint, amount: bigint) {
		clearReleaseFundsFeedback(org.slug, proposalId);
		runReleaseFunds(org, proposalId, amount);
	}

	const sortedProposals = $derived(
		[...proposals].sort((a, b) => {
			const priority = (state: ProposalState) => {
				if (state === ProposalState.Approved) return 0;
				if (state === ProposalState.Pending) return 1;
				if (state === ProposalState.Executed) return 2;
				return 3;
			};
			const diff = priority(a.state) - priority(b.state);
			return diff !== 0 ? diff : Number(b.id - a.id);
		})
	);

	const approvedCount = $derived(
		proposals.filter((proposal) => proposal.state === ProposalState.Approved).length
	);
</script>

<div class="space-y-4 rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm hover:shadow-md transition-shadow">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<h3 class="flex items-center gap-2 font-bold text-lg">
				<Banknote class="text-primary size-5" />
				Tus propuestas
			</h3>
			<p class="text-muted-foreground mt-1 text-sm">
				Seguimiento de las decisiones que proponés y el estado de los fondos asociados.
			</p>
		</div>
		{#if approvedCount > 0}
			<Badge class="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/20">
				{approvedCount} {approvedCount === 1 ? "lista para liberar" : "listas para liberar"}
			</Badge>
		{/if}
	</div>

	{#if proposals.length === 0}
		<p class="text-muted-foreground text-sm">
			Todavía no creaste propuestas. Usá el formulario de arriba para proponer una decisión.
		</p>
	{:else}
		<div class="space-y-4">
			{#each sortedProposals as proposal (proposal.id)}
				{@const key = feedbackKey(proposal.id)}
				{@const feedback = dashboard.releaseFundsFeedback[key]}
				{@const isReleasing = dashboard.actionLoading === `release-${key}`}
				<div
					class="rounded-xl border p-5 transition-colors {proposal.state === ProposalState.Approved
						? 'border-emerald-500/30 bg-emerald-500/5'
						: 'border-border/50 bg-muted/20'}"
				>
					<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
						<span class="font-medium text-muted-foreground">Propuesta #{proposal.id.toString()}</span>
						<Badge variant={stateVariant(proposal.state)}>
							{proposalStateName(proposal.state)}
						</Badge>
					</div>

					<p class="text-foreground mb-4 text-base leading-relaxed">{proposal.description}</p>

					<div
						class="text-muted-foreground mb-4 flex flex-wrap gap-4 rounded-lg border border-border/50 bg-background/50 p-3 text-sm"
					>
						<span>
							Monto:
							<strong class="text-foreground">{formatEther(proposal.amount)} ETH</strong>
						</span>
						<span>
							Votos a favor:
							<strong class="text-foreground">{proposal.forVotes.toString()}</strong>
						</span>
						<span>
							Votos en contra:
							<strong class="text-foreground">{proposal.againstVotes.toString()}</strong>
						</span>
					</div>

					{#if proposal.state === ProposalState.Approved}
						<div class="mb-4 flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
							<Sparkles class="mt-0.5 size-4 shrink-0" />
							<p>
								La organización aprobó esta propuesta. Podés liberar
								<strong>{formatEther(proposal.amount)} ETH</strong> de la tesorería hacia tu billetera.
							</p>
						</div>
					{:else if proposal.state === ProposalState.Executed}
						<div class="mb-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
							<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-emerald-600" />
							<p>
								Ya transferimos <strong>{formatEther(proposal.amount)} ETH</strong> a tu billetera según lo aprobado.
							</p>
						</div>
					{:else if proposal.state === ProposalState.Pending}
						<p class="text-muted-foreground mb-4 text-sm">
							Esta propuesta está en votación. Cuando la mayoría la apruebe, vas a poder liberar los fondos desde acá.
						</p>
					{:else if proposal.state === ProposalState.Rejected}
						<p class="text-muted-foreground mb-4 text-sm">
							La organización rechazó esta propuesta. No se liberarán fondos.
						</p>
					{/if}

					{#if feedback?.phase === "success"}
						<div
							class="mb-4 flex items-start gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400"
						>
							<CheckCircle2 class="mt-0.5 size-4 shrink-0" />
							{feedback.message}
						</div>
					{:else if feedback?.phase === "error"}
						<div
							class="border-destructive/30 bg-destructive/5 mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
						>
							<AlertCircle class="text-destructive mt-0.5 size-4 shrink-0" />
							{feedback.message}
						</div>
					{:else if feedback && feedback.phase !== "idle"}
						<div class="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
							<Loader2 class="size-4 animate-spin" />
							{feedback.message}
						</div>
					{/if}

					{#if proposal.state === ProposalState.Approved}
						<Button
							size="lg"
							class="h-11 gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:opacity-90 shadow-md"
							disabled={isReleasing || feedback?.phase === "success"}
							onclick={() => releaseFunds(proposal.id, proposal.amount)}
						>
							{#if isReleasing}
								<Loader2 class="size-4 animate-spin" />
							{/if}
							Liberar {formatEther(proposal.amount)} ETH
						</Button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>