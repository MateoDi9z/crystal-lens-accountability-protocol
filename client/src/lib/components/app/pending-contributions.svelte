<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Banknote, CheckCircle2, Loader2, AlertCircle } from "@lucide/svelte";
	import { formatEther } from "viem";
	import {
		getDashboardState,
		getDebtRemaining,
		runPayment,
		clearPaymentFeedback
	} from "$lib/stores/dashboard.svelte";
	import CheckoutTicketModal from "$lib/components/app/checkout-ticket-modal.svelte";
	import { resolveOrgAddresses } from "$lib/contracts/read";
	import type { OrgConfig } from "$lib/config/orgs";
	import type { Address } from "viem";

	const dashboard = getDashboardState();

	let isModalOpen = $state(false);
	let selectedOrg = $state<OrgConfig | null>(null);
	let selectedAmount = $state<bigint>(0n);
	let targetTreasury = $state<Address | null>(null);

	async function openPayModal(org: OrgConfig, amount: bigint) {
		selectedOrg = org;
		selectedAmount = amount;
		try {
			const { treasury } = await resolveOrgAddresses(org);
			targetTreasury = treasury;
		} catch {
			targetTreasury = null;
		}
		isModalOpen = true;
	}

	function confirmPay() {
		if (!selectedOrg) return;
		clearPaymentFeedback(selectedOrg.slug);
		runPayment(selectedOrg, selectedAmount);
	}
</script>

<Card class="border-primary/20 shadow-md">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-2xl font-bold tracking-tight">
			<Banknote class="text-primary size-6" />
			Tus aportes pendientes
		</CardTitle>
		<CardDescription class="text-base mt-1">
			Acá podés ver y realizar los aportes acordados con tus organizaciones. Un par de clics y quedás al día.
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		{#if dashboard.pendingOrgs.length === 0}
			<div class="bg-muted/50 flex items-start gap-3 rounded-xl p-5">
				<CheckCircle2 class="mt-0.5 size-5 shrink-0 text-emerald-600" />
				<div>
					<p class="font-medium">Estás al día</p>
					<p class="text-muted-foreground mt-1 text-sm">
						No tenés contribuciones pendientes en ninguna organización.
					</p>
				</div>
			</div>
		{:else}
			{#each dashboard.pendingOrgs as entry (entry.org.slug)}
				{@const debt = getDebtRemaining(entry.userStatus)}
				{@const feedback = dashboard.paymentFeedback[entry.org.slug]}
				{@const isPaying = dashboard.actionLoading === `pay-${entry.org.slug}`}
				<div class="border-border/50 bg-muted/20 relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md">
					<div class="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-400"></div>
					<div class="mb-5 flex flex-wrap items-start justify-between gap-3">
						<div>
							<p class="text-xl font-bold">{entry.org.name}</p>
							<p class="text-muted-foreground mt-1 text-sm">
								Monto pendiente: <strong class="text-foreground text-base">{formatEther(debt)} ETH</strong>
							</p>
						</div>
						<Badge variant="outline" class="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">Aporte requerido</Badge>
					</div>

					{#if feedback?.phase === "success"}
						<div class="mb-4 flex items-start gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
							<CheckCircle2 class="mt-0.5 size-4 shrink-0" />
							{feedback.message}
						</div>
					{:else if feedback?.phase === "error"}
						<div class="border-destructive/30 bg-destructive/5 mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm">
							<AlertCircle class="text-destructive mt-0.5 size-4 shrink-0" />
							{feedback.message}
						</div>
					{:else if feedback && feedback.phase !== "idle"}
						<div class="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
							<Loader2 class="size-4 animate-spin" />
							{feedback.message}
						</div>
					{/if}

					<Button
						size="lg"
						class="h-12 w-full gap-2 text-base font-semibold sm:w-auto sm:min-w-[280px] bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity shadow-md"
						disabled={isPaying || feedback?.phase === "success"}
						onclick={() => openPayModal(entry.org, entry.userStatus.pendingContribution)}
					>
						{#if isPaying}
							<Loader2 class="size-5 animate-spin" />
						{/if}
						Realizar aporte ahora
					</Button>
				</div>
			{/each}
		{/if}
	</CardContent>
</Card>

{#if selectedOrg}
	<CheckoutTicketModal
		bind:open={isModalOpen}
		title="Confirmar Aporte"
		subtitle="Estás por abonar tu contribución pendiente a la organización"
		targetLabel="Tesorería de destino"
		targetAddress={targetTreasury}
		amountEth={formatEther(selectedAmount)}
		details={[
			{ label: "Organización", value: selectedOrg.name }
		]}
		confirmText="Confirmar y Pagar"
		onconfirm={confirmPay}
	/>
{/if}