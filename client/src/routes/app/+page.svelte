<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { Loader2, RefreshCw } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import ConnectPrompt from "$lib/components/app/connect-prompt.svelte";
	import TreasuryCard from "$lib/components/app/treasury-card.svelte";
	import UserStatus from "$lib/components/app/user-status.svelte";
	import ProposalsList from "$lib/components/app/proposals-list.svelte";
	import MembersList from "$lib/components/app/members-list.svelte";
	import OwnerPanel from "$lib/components/app/owner-panel.svelte";
	import { getWallet } from "$lib/stores/wallet.svelte";
	import { getDashboardState, refreshDashboard, clearActionMessage } from "$lib/stores/dashboard.svelte";

	const wallet = getWallet();
	const dashboard = getDashboardState();

	onMount(() => {
		if (!browser) return;
		void refreshDashboard(wallet.address);

		const interval = setInterval(() => {
			if (wallet.isConnected) void refreshDashboard(wallet.address);
		}, 15000);

		return () => clearInterval(interval);
	});

	$effect(() => {
		if (wallet.isConnected && wallet.address) {
			void refreshDashboard(wallet.address);
		}
	});

	async function reload() {
		clearActionMessage();
		await refreshDashboard(wallet.address);
	}
</script>

<svelte:head>
	<title>Dashboard — Crystal Lens</title>
</svelte:head>

{#if !wallet.isConnected}
	<ConnectPrompt />
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
			<p class="text-muted-foreground mt-1 text-sm">
				Live data from Membership, Treasury, and Governance on Anvil.
			</p>
		</div>
		<Button variant="outline" size="sm" class="gap-2" disabled={dashboard.loading} onclick={reload}>
			{#if dashboard.loading}
				<Loader2 class="size-3.5 animate-spin" />
			{:else}
				<RefreshCw class="size-3.5" />
			{/if}
			Refresh
		</Button>
	</div>

	{#if dashboard.actionMessage}
		<div class="bg-muted/60 mb-4 rounded-lg border px-4 py-3 text-sm">{dashboard.actionMessage}</div>
	{/if}

	{#if dashboard.error}
		<div class="bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm">
			{dashboard.error}
			<p class="text-muted-foreground mt-1 text-xs">Make sure Anvil is running at http://127.0.0.1:8545</p>
		</div>
	{/if}

	{#if dashboard.loading && !dashboard.data}
		<div class="flex items-center justify-center py-24">
			<Loader2 class="text-muted-foreground size-8 animate-spin" />
		</div>
	{:else if dashboard.data}
		<div class="grid gap-6">
			{#if dashboard.data.isOwner && wallet.address}
				<OwnerPanel members={dashboard.data.members} userAddress={wallet.address} />
			{/if}
			{#if dashboard.data.user}
				<UserStatus user={dashboard.data.user} />
			{/if}
			<TreasuryCard treasury={dashboard.data.treasury} />
			<ProposalsList
				proposals={dashboard.data.proposals}
				user={dashboard.data.user}
				votes={dashboard.votes}
			/>
			<MembersList members={dashboard.data.members} />
		</div>
	{/if}
{/if}