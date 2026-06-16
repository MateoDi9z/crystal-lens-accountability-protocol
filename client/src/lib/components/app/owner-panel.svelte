<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Crown, Loader2, UserPlus, FilePlus, Coins } from "@lucide/svelte";
	import { formatEther, isAddress, parseEther, type Address } from "viem";
	import type { Member } from "$lib/contracts/types";
	import {
		registerContributor,
		requestContribution,
		createProposal
	} from "$lib/contracts/write";
	import { refreshDashboard, runAction, getDashboardState } from "$lib/stores/dashboard.svelte";
	import { OWNER_ADDRESS } from "$lib/config/owner";

	let { members, userAddress }: { members: Member[]; userAddress: Address } = $props();

	const dashboard = getDashboardState();

	let wallet = $state("");
	let dni = $state("");
	let fullName = $state("");
	let contributionEth = $state("1");

	let existingWallet = $state("");
	let additionalDebtEth = $state("0.5");

	let proposalDescription = $state("");
	let proposalAmountEth = $state("0.5");

	let formError = $state<string | null>(null);

	function validateAddress(value: string): Address | null {
		if (!isAddress(value)) return null;
		return value as Address;
	}

	async function handleRegister() {
		formError = null;
		const to = validateAddress(wallet.trim());
		if (!to) {
			formError = "Invalid wallet address";
			return;
		}
		if (!dni.trim() || !fullName.trim()) {
			formError = "DNI and full name are required";
			return;
		}

		let amount: bigint;
		try {
			amount = parseEther(contributionEth);
		} catch {
			formError = "Invalid contribution amount";
			return;
		}
		if (amount <= 0n) {
			formError = "Contribution must be greater than 0";
			return;
		}

		await runAction(
			"register-contributor",
			() => registerContributor(to, dni.trim(), fullName.trim(), amount),
			() => refreshDashboard(userAddress)
		);

		wallet = "";
		dni = "";
		fullName = "";
		contributionEth = "1";
	}

	async function handleRequestDebt() {
		formError = null;
		const contributor = validateAddress(existingWallet.trim());
		if (!contributor) {
			formError = "Invalid wallet address";
			return;
		}

		let amount: bigint;
		try {
			amount = parseEther(additionalDebtEth);
		} catch {
			formError = "Invalid debt amount";
			return;
		}
		if (amount <= 0n) {
			formError = "Debt amount must be greater than 0";
			return;
		}

		await runAction(
			"request-debt",
			() => requestContribution(contributor, amount),
			() => refreshDashboard(userAddress)
		);

		existingWallet = "";
		additionalDebtEth = "0.5";
	}

	async function handleCreateProposal() {
		formError = null;
		if (!proposalDescription.trim()) {
			formError = "Proposal description is required";
			return;
		}

		let amount: bigint;
		try {
			amount = parseEther(proposalAmountEth);
		} catch {
			formError = "Invalid proposal amount";
			return;
		}
		if (amount <= 0n) {
			formError = "Proposal amount must be greater than 0";
			return;
		}

		await runAction(
			"create-proposal",
			() => createProposal(proposalDescription.trim(), amount),
			() => refreshDashboard(userAddress)
		);

		proposalDescription = "";
		proposalAmountEth = "0.5";
	}

	function debtStatus(member: Member) {
		if (!member.isContributor) return { label: "No debt assigned", variant: "outline" as const };
		if (member.isUpToDate) return { label: "Up to date", variant: "secondary" as const };
		return { label: "Debt pending", variant: "destructive" as const };
	}
</script>

<Card class="border-primary/20">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-lg">
			<Crown class="text-primary size-5" />
			Owner Panel
		</CardTitle>
		<CardDescription>
			Connected as owner <span class="font-mono">{OWNER_ADDRESS.slice(0, 6)}…{OWNER_ADDRESS.slice(-4)}</span>
		</CardDescription>
	</CardHeader>
	<CardContent class="grid gap-8">
		{#if formError}
			<p class="text-destructive text-sm">{formError}</p>
		{/if}

		<div class="grid gap-6 lg:grid-cols-2">
			<div class="space-y-4 rounded-xl border p-4">
				<h3 class="flex items-center gap-2 font-semibold">
					<UserPlus class="size-4" />
					Register contributor
				</h3>
				<p class="text-muted-foreground text-xs">
					Mints membership and assigns an initial contribution debt.
				</p>
				<div class="space-y-3">
					<input
						class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Wallet address (0x...)"
						bind:value={wallet}
					/>
					<div class="grid gap-3 sm:grid-cols-2">
						<input
							class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
							placeholder="DNI"
							bind:value={dni}
						/>
						<input
							class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
							placeholder="Full name"
							bind:value={fullName}
						/>
					</div>
					<input
						class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Contribution (ETH)"
						bind:value={contributionEth}
					/>
					<Button
						class="w-full gap-2"
						disabled={dashboard.actionLoading === "register-contributor"}
						onclick={handleRegister}
					>
						{#if dashboard.actionLoading === "register-contributor"}
							<Loader2 class="size-4 animate-spin" />
						{/if}
						Register contributor
					</Button>
				</div>
			</div>

			<div class="space-y-4 rounded-xl border p-4">
				<h3 class="flex items-center gap-2 font-semibold">
					<Coins class="size-4" />
					Assign debt to member
				</h3>
				<p class="text-muted-foreground text-xs">
					Request an additional contribution from an existing member.
				</p>
				<div class="space-y-3">
					<input
						class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Member wallet (0x...)"
						bind:value={existingWallet}
					/>
					<input
						class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Debt amount (ETH)"
						bind:value={additionalDebtEth}
					/>
					<Button
						variant="outline"
						class="w-full gap-2"
						disabled={dashboard.actionLoading === "request-debt"}
						onclick={handleRequestDebt}
					>
						{#if dashboard.actionLoading === "request-debt"}
							<Loader2 class="size-4 animate-spin" />
						{/if}
						Request contribution
					</Button>
				</div>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border p-4">
			<h3 class="flex items-center gap-2 font-semibold">
				<FilePlus class="size-4" />
				Create proposal
			</h3>
			<div class="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
				<input
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Proposal description"
					bind:value={proposalDescription}
				/>
				<input
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Amount (ETH)"
					bind:value={proposalAmountEth}
				/>
				<Button
					disabled={dashboard.actionLoading === "create-proposal"}
					onclick={handleCreateProposal}
				>
					{#if dashboard.actionLoading === "create-proposal"}
						<Loader2 class="size-4 animate-spin" />
					{/if}
					Create
				</Button>
			</div>
		</div>

		<div class="space-y-3">
			<h3 class="font-semibold">Contributors & debts</h3>
			{#if members.length === 0}
				<p class="text-muted-foreground text-sm">No contributors registered yet.</p>
			{:else}
				<div class="overflow-x-auto rounded-xl border">
					<table class="w-full min-w-[640px] text-left text-sm">
						<thead class="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
							<tr>
								<th class="px-4 py-3">Member</th>
								<th class="px-4 py-3">Wallet</th>
								<th class="px-4 py-3">Pending</th>
								<th class="px-4 py-3">Paid</th>
								<th class="px-4 py-3">Debt left</th>
								<th class="px-4 py-3">Status</th>
							</tr>
						</thead>
						<tbody class="divide-border/80 divide-y">
							{#each members as member (member.address)}
								{@const status = debtStatus(member)}
								<tr>
									<td class="px-4 py-3">
										<p class="font-medium">{member.data?.fullName ?? "—"}</p>
										<p class="text-muted-foreground text-xs">DNI {member.data?.dni ?? "—"}</p>
									</td>
									<td class="text-muted-foreground px-4 py-3 font-mono text-xs">
										{member.address.slice(0, 6)}…{member.address.slice(-4)}
									</td>
									<td class="px-4 py-3">{member.pendingContribution > 0n ? `${formatEther(member.pendingContribution)} ETH` : "—"}</td>
									<td class="px-4 py-3">{member.totalPaid > 0n ? `${formatEther(member.totalPaid)} ETH` : "—"}</td>
									<td class="px-4 py-3 font-medium">
										{member.debtRemaining > 0n ? `${formatEther(member.debtRemaining)} ETH` : "0 ETH"}
									</td>
									<td class="px-4 py-3">
										<Badge variant={status.variant}>{status.label}</Badge>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</CardContent>
</Card>