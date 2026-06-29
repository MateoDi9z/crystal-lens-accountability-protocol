<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import AddressDisplay from "$lib/components/app/address-display.svelte";
	import { Crown, Loader2, UserPlus, FilePlus, Coins } from "@lucide/svelte";
	import { formatEther, isAddress, parseEther, type Address } from "viem";
	import type { Member, Proposal } from "$lib/contracts/types";
	import OwnerProposalsSection from "$lib/components/app/owner-proposals-section.svelte";
	import {
		registerContributor,
		requestContribution,
		createProposal
	} from "$lib/contracts/write";
	import {
		refreshAllOrgsDashboard,
		runAction,
		getDashboardState
	} from "$lib/stores/dashboard.svelte";
	import type { OrgConfig } from "$lib/config/orgs";

	let {
		org,
		members,
		proposals,
		userAddress
	}: {
		org: OrgConfig;
		members: Member[];
		proposals: Proposal[];
		userAddress: Address;
	} = $props();

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
			`register-contributor-${org.slug}`,
			() => registerContributor(to, dni.trim(), fullName.trim(), amount, org),
			() => refreshAllOrgsDashboard(userAddress)
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
			`request-debt-${org.slug}`,
			() => requestContribution(contributor, amount, org),
			() => refreshAllOrgsDashboard(userAddress)
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
			`create-proposal-${org.slug}`,
			() => createProposal(proposalDescription.trim(), amount, org),
			() => refreshAllOrgsDashboard(userAddress)
		);

		proposalDescription = "";
		proposalAmountEth = "0.5";
	}

	function debtStatus(member: Member) {
		if (!member.isContributor) return { label: "Sin aportes asignados", variant: "outline" as const };
		if (member.isUpToDate) return { label: "Al día", variant: "secondary" as const };
		return { label: "Aporte pendiente", variant: "destructive" as const };
	}
</script>

<Card class="border-border/50 bg-background/50 backdrop-blur-xl shadow-xl overflow-hidden">
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
	<div class="relative">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-2xl font-bold tracking-tight">
			<Crown class="text-primary size-6" />
			Panel de gestión
		</CardTitle>
		<CardDescription class="text-base">
			Gestionando como dueño de {org.name}
			<AddressDisplay address={userAddress} truncate class="bg-muted/50 rounded-md px-1.5 py-0.5 text-xs" />
		</CardDescription>
	</CardHeader>
	<CardContent class="grid gap-8">
		{#if formError}
			<p class="text-destructive text-sm">{formError}</p>
		{/if}

		<div class="grid gap-6 lg:grid-cols-2">
			<div class="space-y-4 rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm hover:shadow-md transition-shadow">
				<h3 class="flex items-center gap-2 font-bold text-lg">
					<UserPlus class="text-primary size-5" />
					Invitar nuevo miembro
				</h3>
				<p class="text-muted-foreground text-sm">
					Registra al usuario en la organización y le asigna su primer compromiso de aporte.
				</p>
				<div class="space-y-3 mt-4">
					<input
						class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Cuenta (Ej. 0x...)"
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
							placeholder="Nombre completo"
							bind:value={fullName}
						/>
					</div>
					<input
						class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Aporte inicial (ETH)"
						bind:value={contributionEth}
					/>
					<Button
						class="w-full gap-2 mt-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-md"
						disabled={dashboard.actionLoading === `register-contributor-${org.slug}`}
						onclick={handleRegister}
					>
						{#if dashboard.actionLoading === `register-contributor-${org.slug}`}
							<Loader2 class="size-4 animate-spin" />
						{/if}
						Registrar miembro
					</Button>
				</div>
			</div>

			<div class="space-y-4 rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm hover:shadow-md transition-shadow">
				<h3 class="flex items-center gap-2 font-bold text-lg">
					<Coins class="text-primary size-5" />
					Solicitar nuevo aporte
				</h3>
				<p class="text-muted-foreground text-sm">
					Pide un nuevo compromiso de aporte a un miembro activo.
				</p>
				<div class="space-y-3 mt-4">
					<input
						class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Cuenta del miembro (0x...)"
						bind:value={existingWallet}
					/>
					<input
						class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Monto a solicitar (ETH)"
						bind:value={additionalDebtEth}
					/>
					<Button
						variant="outline"
						class="w-full gap-2 mt-2 border-primary/20 hover:bg-primary/5 text-primary"
						disabled={dashboard.actionLoading === `request-debt-${org.slug}`}
						onclick={handleRequestDebt}
					>
						{#if dashboard.actionLoading === `request-debt-${org.slug}`}
							<Loader2 class="size-4 animate-spin" />
						{/if}
						Solicitar aporte
					</Button>
				</div>
			</div>
		</div>

		<div class="space-y-4 rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm hover:shadow-md transition-shadow">
			<h3 class="flex items-center gap-2 font-bold text-lg">
				<FilePlus class="text-primary size-5" />
				Proponer decisión
			</h3>
			<div class="grid gap-3 sm:grid-cols-[1fr_160px_auto] mt-2">
				<input
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Descripción de la propuesta"
					bind:value={proposalDescription}
				/>
				<input
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Monto requerido (ETH)"
					bind:value={proposalAmountEth}
				/>
				<Button
					disabled={dashboard.actionLoading === `create-proposal-${org.slug}`}
					onclick={handleCreateProposal}
				>
					{#if dashboard.actionLoading === `create-proposal-${org.slug}`}
						<Loader2 class="size-4 animate-spin" />
					{/if}
					Proponer
				</Button>
			</div>
		</div>

		<OwnerProposalsSection {org} {proposals} />

		<div class="space-y-4">
			<h3 class="font-bold text-xl">Miembros y aportes</h3>
			{#if members.length === 0}
				<p class="text-muted-foreground text-sm">Todavía no hay miembros registrados.</p>
			{:else}
				<div class="overflow-x-auto rounded-2xl border border-border/50 shadow-sm">
					<table class="w-full min-w-[640px] text-left text-sm">
						<thead class="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
							<tr>
								<th class="px-5 py-4">Miembro</th>
								<th class="px-5 py-4">Cuenta</th>
								<th class="px-5 py-4">Comprometido</th>
								<th class="px-5 py-4">Aportado</th>
								<th class="px-5 py-4">Saldo Restante</th>
								<th class="px-5 py-4">Estado</th>
							</tr>
						</thead>
						<tbody class="divide-border/50 divide-y bg-card/50">
							{#each members as member (member.address)}
								{@const status = debtStatus(member)}
								<tr class="transition-colors hover:bg-muted/20">
									<td class="px-5 py-4">
										<p class="font-semibold text-foreground">{member.data?.fullName ?? "—"}</p>
										<p class="text-muted-foreground text-xs mt-0.5">DNI {member.data?.dni ?? "—"}</p>
									</td>
									<td class="text-muted-foreground px-5 py-4 text-xs">
										<AddressDisplay address={member.address} truncate />
									</td>
									<td class="px-5 py-4">{member.pendingContribution > 0n ? `${formatEther(member.pendingContribution)} ETH` : "—"}</td>
									<td class="px-5 py-4 text-emerald-600 dark:text-emerald-400 font-medium">{member.totalPaid > 0n ? `${formatEther(member.totalPaid)} ETH` : "—"}</td>
									<td class="px-5 py-4 font-bold text-foreground">
										{member.debtRemaining > 0n ? `${formatEther(member.debtRemaining)} ETH` : "0 ETH"}
									</td>
									<td class="px-5 py-4">
										<Badge variant={status.variant} class="shadow-sm">{status.label}</Badge>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</CardContent>
	</div>
</Card>