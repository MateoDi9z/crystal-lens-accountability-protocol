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
	import CheckoutTicketModal, { type TicketDetail } from "$lib/components/app/checkout-ticket-modal.svelte";
	import { resolveOrgAddresses, type ResolvedOrgAddresses } from "$lib/contracts/read";

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

	let resolvedAddresses = $state<ResolvedOrgAddresses | null>(null);
	$effect(() => {
		resolveOrgAddresses(org).then((res) => (resolvedAddresses = res)).catch(() => {});
	});

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

	function prepareRegister() {
		formError = null;
		const to = validateAddress(wallet.trim());
		if (!to) {
			formError = "Dirección de billetera inválida";
			return;
		}
		if (!dni.trim() || !fullName.trim()) {
			formError = "DNI y nombre completo son requeridos";
			return;
		}

		let amount: bigint;
		try {
			amount = parseEther(contributionEth);
		} catch {
			formError = "Monto de contribución inválido";
			return;
		}
		if (amount <= 0n) {
			formError = "La contribución debe ser mayor a 0";
			return;
		}

		ticketConfig = {
			title: "Confirmar Registro de Miembro",
			subtitle: "Registra al usuario, se le asigna una contribución automáticamente.",
			targetLabel: "Contrato de Membresía",
			targetAddress: resolvedAddresses?.membership ?? null,
			amountEth: contributionEth,
			details: [
				{ label: "Cuenta del miembro", value: to, isAddress: true },
				{ label: "Nombre completo", value: fullName.trim() },
				{ label: "DNI", value: dni.trim() }
			],
			onconfirm: handleRegister
		};
		ticketModalOpen = true;
	}

	async function handleRegister() {
		const to = validateAddress(wallet.trim())!;
		const amount = parseEther(contributionEth);

		await runAction(
			`register-contributor-${org.slug}`,
			() => registerContributor(to, dni.trim(), fullName.trim(), amount, org),
			() => refreshAllOrgsDashboard(userAddress),
			{
				title: "Registro de Miembro Completado",
				successMessage: "El nuevo miembro y su aporte fueron registrados en la blockchain."
			}
		);

		wallet = "";
		dni = "";
		fullName = "";
		contributionEth = "1";
	}

	function prepareRequestDebt() {
		formError = null;
		const contributor = validateAddress(existingWallet.trim());
		if (!contributor) {
			formError = "Dirección de billetera inválida";
			return;
		}

		let amount: bigint;
		try {
			amount = parseEther(additionalDebtEth);
		} catch {
			formError = "Monto de solicitud inválido";
			return;
		}
		if (amount <= 0n) {
			formError = "El monto solicitado debe ser mayor a 0";
			return;
		}

		ticketConfig = {
			title: "Confirmar Solicitud de Aporte",
			subtitle: "Pide un nuevo compromiso de contribución a un miembro activo",
			targetLabel: "Contrato de Tesorería",
			targetAddress: resolvedAddresses?.treasury ?? null,
			amountEth: additionalDebtEth,
			details: [
				{ label: "Cuenta del miembro", value: contributor, isAddress: true }
			],
			onconfirm: handleRequestDebt
		};
		ticketModalOpen = true;
	}

	async function handleRequestDebt() {
		const contributor = validateAddress(existingWallet.trim())!;
		const amount = parseEther(additionalDebtEth);

		await runAction(
			`request-debt-${org.slug}`,
			() => requestContribution(contributor, amount, org),
			() => refreshAllOrgsDashboard(userAddress),
			{
				title: "Solicitud Registrada",
				successMessage: "El nuevo compromiso de aporte fue enviado a la tesorería."
			}
		);

		existingWallet = "";
		additionalDebtEth = "0.5";
	}

	function prepareCreateProposal() {
		formError = null;
		if (!proposalDescription.trim()) {
			formError = "La descripción de la propuesta es requerida";
			return;
		}

		let amount: bigint;
		try {
			amount = parseEther(proposalAmountEth);
		} catch {
			formError = "Monto de propuesta inválido";
			return;
		}
		if (amount <= 0n) {
			formError = "El monto solicitado debe ser mayor a 0";
			return;
		}

		ticketConfig = {
			title: "Confirmar Nueva Propuesta",
			subtitle: "Publica una propuesta para la votación de la comunidad",
			targetLabel: "Contrato de Gobernanza",
			targetAddress: resolvedAddresses?.governance ?? null,
			amountEth: proposalAmountEth,
			details: [
				{ label: "Descripción", value: proposalDescription.trim() }
			],
			onconfirm: handleCreateProposal
		};
		ticketModalOpen = true;
	}

	async function handleCreateProposal() {
		const amount = parseEther(proposalAmountEth);

		await runAction(
			`create-proposal-${org.slug}`,
			() => createProposal(proposalDescription.trim(), amount, org),
			() => refreshAllOrgsDashboard(userAddress),
			{
				title: "Propuesta Creada",
				successMessage: "La propuesta fue publicada on-chain para votación de la comunidad."
			}
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
		<CardDescription class="text-base flex items-center gap-1.5 flex-wrap">
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
					Registra al usuario, se le asigna una contribucion automaticamente.
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
						onclick={prepareRegister}
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
						onclick={prepareRequestDebt}
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
					onclick={prepareCreateProposal}
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
									<td class="px-5 py-4 text-xs">
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