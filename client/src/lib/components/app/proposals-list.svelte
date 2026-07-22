<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Loader2, Vote, CheckCircle2 } from "@lucide/svelte";
	import { formatEther } from "viem";
	import { ProposalState, type Proposal, type UserStatus } from "$lib/contracts/types";
	import { proposalStateName } from "$lib/contracts/read";
	import { executeProposal, voteOnProposal } from "$lib/contracts/write";
	import { refreshDashboard, refreshAllOrgsDashboard, runAction, getDashboardState } from "$lib/stores/dashboard.svelte";

	import CheckoutTicketModal, { type TicketDetail } from "$lib/components/app/checkout-ticket-modal.svelte";
	import { resolveOrgAddresses } from "$lib/contracts/read";
	import { getActiveOrg } from "$lib/stores/dashboard.svelte";
	import type { Address } from "viem";

	let {
		proposals,
		user,
		votes,
		readonly = false
	}: {
		proposals: Proposal[];
		user?: UserStatus;
		votes: Record<string, boolean>;
		readonly?: boolean;
	} = $props();

	const dashboard = getDashboardState();

	let ticketModalOpen = $state(false);
	let ticketConfig = $state<{
		title: string;
		subtitle: string;
		targetLabel: string;
		targetAddress: Address | null;
		amountEth?: string | null;
		details: TicketDetail[];
		onconfirm: () => void;
	} | null>(null);

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

	async function prepareVote(id: bigint, support: boolean) {
		if (!user) return;
		const org = getActiveOrg();
		let govAddr: Address | null = null;
		if (org) {
			try {
				const { governance } = await resolveOrgAddresses(org);
				govAddr = governance;
			} catch {}
		}

		ticketConfig = {
			title: "Confirmar Voto",
			subtitle: "Registra tu voto on-chain para esta propuesta de gobernanza",
			targetLabel: "Contrato de Gobernanza",
			targetAddress: govAddr,
			details: [
				{ label: "Propuesta", value: `#${id.toString()}` },
				{ label: "Tu Voto", value: support ? "A Favor" : "En Contra" }
			],
			onconfirm: () => vote(id, support)
		};
		ticketModalOpen = true;
	}

	async function vote(id: bigint, support: boolean) {
		if (!user) return;
		await runAction(
			`vote-${id}-${support}`,
			() => voteOnProposal(id, support),
			async () => {
				await refreshDashboard(user.address);
				await refreshAllOrgsDashboard(user.address);
			},
			{
				title: "Voto Registrado",
				successMessage: `Tu voto ${support ? "a favor" : "en contra"} fue contabilizado on-chain.`
			}
		);
	}

	async function prepareExecute(proposal: Proposal) {
		const org = getActiveOrg();
		let govAddr: Address | null = null;
		if (org) {
			try {
				const { governance } = await resolveOrgAddresses(org);
				govAddr = governance;
			} catch {}
		}

		ticketConfig = {
			title: "Confirmar Liberación de Fondos",
			subtitle: "Transfiere los fondos aprobados desde la tesorería de la organización",
			targetLabel: "Contrato de Gobernanza",
			targetAddress: govAddr,
			amountEth: formatEther(proposal.amount),
			details: [
				{ label: "Propuesta", value: `#${proposal.id.toString()}` },
				{ label: "Proponente / Destino", value: proposal.proposer, isAddress: true }
			],
			onconfirm: () => execute(proposal.id)
		};
		ticketModalOpen = true;
	}

	async function execute(id: bigint) {
		await runAction(
			`execute-${id}`,
			() => executeProposal(id),
			async () => {
				if (user) {
					await refreshDashboard(user.address);
					await refreshAllOrgsDashboard(user.address);
				} else {
					await refreshDashboard();
					await refreshAllOrgsDashboard();
				}
			},
			{
				title: "Fondos Liberados",
				successMessage: "La tesorería transfirió exitosamente los fondos aprobados."
			}
		);
	}
</script>

<Card class="border-border/50 shadow-md">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-xl font-bold">
			<Vote class="text-primary size-5" />
			Propuestas de Gobernanza
		</CardTitle>
		<CardDescription>
			Votación y ejecución de decisiones en tiempo real leídas del contrato inteligente.
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		{#if proposals.length === 0}
			<p class="text-muted-foreground text-sm py-4">Aún no hay propuestas registradas.</p>
		{:else}
			{#each proposals as proposal (proposal.id)}
				{@const voted = votes[proposal.id.toString()]}
				{@const canVote =
					user?.canVote &&
					proposal.state === ProposalState.Pending &&
					!voted}
				<div class="border-border/80 rounded-xl border p-4 transition-all bg-card/40 hover:bg-card/70">
					<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
						<h3 class="font-semibold text-foreground text-base">Propuesta #{proposal.id.toString()}</h3>
						<Badge variant={stateVariant(proposal.state)} class="px-2.5 py-0.5 font-medium">
							{proposalStateName(proposal.state)}
						</Badge>
					</div>
					<p class="text-muted-foreground mb-3 text-sm leading-relaxed">{proposal.description}</p>
					
					<div class="text-muted-foreground mb-4 flex flex-wrap gap-4 text-xs font-medium bg-muted/30 p-2.5 rounded-lg">
						{#if proposal.state === ProposalState.Executed}
							<span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
								<CheckCircle2 class="size-3.5" />
								Fondos liberados:
								<strong>{formatEther(proposal.amount)} ETH</strong>
							</span>
						{:else}
							<span>
								Monto a requerir:
								<strong class="text-foreground">{formatEther(proposal.amount)} ETH</strong>
							</span>
						{/if}
						<span>A favor: <strong class="text-foreground">{proposal.forVotes.toString()}</strong></span>
						<span>En contra: <strong class="text-foreground">{proposal.againstVotes.toString()}</strong></span>
					</div>

					{#if !readonly}
					<div class="flex flex-wrap items-center gap-2">
						{#if canVote}
							<Button
								size="sm"
								disabled={dashboard.actionLoading === `vote-${proposal.id}-true`}
								onclick={() => prepareVote(proposal.id, true)}
							>
								{#if dashboard.actionLoading === `vote-${proposal.id}-true`}
									<Loader2 class="size-3.5 animate-spin" />
								{/if}
								Votar a favor
							</Button>
							<Button
								size="sm"
								variant="outline"
								disabled={dashboard.actionLoading === `vote-${proposal.id}-false`}
								onclick={() => prepareVote(proposal.id, false)}
							>
								{#if dashboard.actionLoading === `vote-${proposal.id}-false`}
									<Loader2 class="size-3.5 animate-spin" />
								{/if}
								Votar en contra
							</Button>
						{:else if voted}
							<Badge variant="secondary" class="gap-1">
								<CheckCircle2 class="size-3" /> Ya votaste en esta propuesta
							</Badge>
						{:else if user && proposal.state === ProposalState.Pending && !user.canVote}
							<Badge variant="outline" class="text-muted-foreground">
								Requieres estar al día (0 ETH de deuda) para votar
							</Badge>
						{/if}

						{#if proposal.state === ProposalState.Approved}
							<div class="w-full sm:w-auto mt-2 sm:mt-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
								<span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
									¡Propuesta Aprobada!
								</span>
								<Button
									size="sm"
									class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm gap-1.5"
									disabled={dashboard.actionLoading === `execute-${proposal.id}`}
									onclick={() => prepareExecute(proposal)}
								>
									{#if dashboard.actionLoading === `execute-${proposal.id}`}
										<Loader2 class="size-3.5 animate-spin" />
									{:else}
										<CheckCircle2 class="size-3.5" />
									{/if}
									Liberar {formatEther(proposal.amount)} ETH
								</Button>
							</div>
						{/if}
					</div>
					{/if}
				</div>
			{/each}
		{/if}
	</CardContent>
</Card>

{#if ticketConfig}
	<CheckoutTicketModal
		bind:open={ticketModalOpen}
		title={ticketConfig.title}
		subtitle={ticketConfig.subtitle}
		targetLabel={ticketConfig.targetLabel}
		targetAddress={ticketConfig.targetAddress}
		amountEth={ticketConfig.amountEth}
		details={ticketConfig.details}
		confirmText="Confirmar en Billetera"
		onconfirm={ticketConfig.onconfirm}
	/>
{/if}