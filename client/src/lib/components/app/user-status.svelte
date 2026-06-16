<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Fingerprint, Loader2 } from "@lucide/svelte";
	import { formatEther } from "viem";
	import type { UserStatus } from "$lib/contracts/types";
	import { payPendingContribution } from "$lib/contracts/write";
	import { refreshDashboard, runAction, getDashboardState } from "$lib/stores/dashboard.svelte";

	let { user }: { user: UserStatus } = $props();
	const dashboard = getDashboardState();

	async function payContribution() {
		await runAction(
			"pay",
			() => payPendingContribution(user.pendingContribution),
			() => refreshDashboard(user.address)
		);
	}

	const canPay = $derived(
		user.isMember && user.pendingContribution > 0n && user.totalPaid < user.pendingContribution
	);
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-lg">
			<Fingerprint class="text-primary size-5" />
			My account
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<p class="font-mono text-sm">{user.address}</p>

		<div class="flex flex-wrap gap-2">
			<Badge variant={user.isMember ? "default" : "outline"}>
				{user.isMember ? "Member" : "Not a member"}
			</Badge>
			<Badge variant={user.isContributor ? "secondary" : "outline"}>
				{user.isContributor ? "Contributor" : "Not a contributor"}
			</Badge>
			{#if user.isMember}
				<Badge variant={user.isUpToDate ? "secondary" : "destructive"}>
					{user.isUpToDate ? "Contributions up to date" : "Payment pending"}
				</Badge>
			{/if}
		</div>

		{#if user.memberData}
			<div class="bg-muted/50 rounded-xl p-4 text-sm">
				<p><span class="text-muted-foreground">Name:</span> {user.memberData.fullName}</p>
				<p class="mt-1"><span class="text-muted-foreground">DNI:</span> {user.memberData.dni}</p>
				{#if user.tokenId !== undefined}
					<p class="mt-1"><span class="text-muted-foreground">Token ID:</span> {user.tokenId.toString()}</p>
				{/if}
			</div>
		{/if}

		<div class="grid gap-3 sm:grid-cols-2">
			<div class="bg-muted/50 rounded-xl p-4">
				<p class="text-muted-foreground text-xs uppercase tracking-wide">Pending</p>
				<p class="text-lg font-semibold">{formatEther(user.pendingContribution)} ETH</p>
			</div>
			<div class="bg-muted/50 rounded-xl p-4">
				<p class="text-muted-foreground text-xs uppercase tracking-wide">Total paid</p>
				<p class="text-lg font-semibold">{formatEther(user.totalPaid)} ETH</p>
			</div>
		</div>

		{#if canPay}
			<Button class="gap-2" disabled={dashboard.actionLoading === "pay"} onclick={payContribution}>
				{#if dashboard.actionLoading === "pay"}
					<Loader2 class="size-4 animate-spin" />
				{/if}
				Pay {formatEther(user.pendingContribution)} ETH
			</Button>
		{/if}
	</CardContent>
</Card>