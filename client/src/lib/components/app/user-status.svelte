<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import AddressDisplay from "$lib/components/app/address-display.svelte";
	import { Fingerprint, Loader2 } from "@lucide/svelte";
	import { formatEther } from "viem";
	import type { UserStatus } from "$lib/contracts/types";
	import {
		refreshDashboard,
		refreshAllOrgsDashboard,
		getActiveOrg,
		runPayment,
		getDashboardState
	} from "$lib/stores/dashboard.svelte";
	import CheckoutTicketModal from "$lib/components/app/checkout-ticket-modal.svelte";
	import { resolveOrgAddresses } from "$lib/contracts/read";
	import type { Address } from "viem";

	let { user }: { user: UserStatus } = $props();
	const dashboard = getDashboardState();

	let isModalOpen = $state(false);
	let targetTreasury = $state<Address | null>(null);

	async function openPayModal() {
		const org = getActiveOrg();
		if (org) {
			try {
				const { treasury } = await resolveOrgAddresses(org);
				targetTreasury = treasury;
			} catch {
				targetTreasury = null;
			}
		}
		isModalOpen = true;
	}

	async function confirmPay() {
		const org = getActiveOrg();
		if (!org) return;
		await runPayment(org, user.pendingContribution);
		await refreshDashboard(user.address);
		await refreshAllOrgsDashboard(user.address);
	}

	const canPay = $derived(
		user.isMember && user.pendingContribution > 0n && user.totalPaid < user.pendingContribution
	);
</script>

<Card class="border-border/50 shadow-md">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-xl font-bold">
			<Fingerprint class="text-primary size-5" />
			Mi Cuenta
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<div>
			<AddressDisplay address={user.address} class="text-sm" />
		</div>

		<div class="flex flex-wrap gap-2">
			<Badge variant={user.isMember ? "default" : "outline"}>
				{user.isMember ? "Miembro Activo" : "No es Miembro"}
			</Badge>
			<Badge variant={user.isContributor ? "secondary" : "outline"}>
				{user.isContributor ? "Contribuyente" : "No Contribuyente"}
			</Badge>
			{#if user.isMember}
				<Badge variant={user.isUpToDate ? "secondary" : "destructive"}>
					{user.isUpToDate ? "Contribuciones al día" : "Pago pendiente"}
				</Badge>
			{/if}
		</div>

		{#if user.memberData}
			<div class="bg-muted/30 border border-border/50 rounded-xl p-4 text-sm space-y-1">
				<p><span class="text-muted-foreground font-medium">Nombre Completo:</span> {user.memberData.fullName}</p>
				<p><span class="text-muted-foreground font-medium">DNI:</span> {user.memberData.dni}</p>
				{#if user.tokenId !== undefined}
					<p><span class="text-muted-foreground font-medium">ID de Token (Soulbound NFT):</span> #{user.tokenId.toString()}</p>
				{/if}
			</div>
		{/if}

		<div class="grid gap-3 sm:grid-cols-2">
			<div class="bg-muted/30 border border-border/50 rounded-xl p-4">
				<p class="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Deuda / Compromiso Pendiente</p>
				<p class="text-xl font-bold text-foreground">{formatEther(user.pendingContribution)} ETH</p>
			</div>
			<div class="bg-muted/30 border border-border/50 rounded-xl p-4">
				<p class="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Total Aportado</p>
				<p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatEther(user.totalPaid)} ETH</p>
			</div>
		</div>

		{#if canPay}
			<Button class="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-md font-semibold" disabled={dashboard.actionLoading === "pay"} onclick={openPayModal}>
				{#if dashboard.actionLoading === "pay"}
					<Loader2 class="size-4 animate-spin" />
				{/if}
				Pagar {formatEther(user.pendingContribution)} ETH ahora
			</Button>
		{/if}
	</CardContent>
</Card>

{#if canPay && getActiveOrg()}
	<CheckoutTicketModal
		bind:open={isModalOpen}
		title="Confirmar Aporte"
		subtitle="Estás por abonar tu contribución pendiente"
		targetLabel="Tesorería de destino"
		targetAddress={targetTreasury}
		amountEth={formatEther(user.pendingContribution)}
		details={[
			{ label: "Organización", value: getActiveOrg()?.name ?? "Organización" }
		]}
		confirmText="Confirmar y Pagar"
		onconfirm={confirmPay}
	/>
{/if}