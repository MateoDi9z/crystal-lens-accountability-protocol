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

	const dashboard = getDashboardState();

	function pay(orgSlug: string, amount: bigint) {
		const entry = dashboard.pendingOrgs.find((item) => item.org.slug === orgSlug);
		if (!entry) return;
		clearPaymentFeedback(orgSlug);
		runPayment(entry.org, amount);
	}
</script>

<Card class="border-primary/20 shadow-md">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-2xl">
			<Banknote class="text-primary size-6" />
			Tus contribuciones pendientes
		</CardTitle>
		<CardDescription class="text-base">
			Acá ves lo que debés a cada organización. Un clic y quedás al día.
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
				<div class="border-border/80 rounded-xl border p-5">
					<div class="mb-4 flex flex-wrap items-start justify-between gap-3">
						<div>
							<p class="text-lg font-semibold">{entry.org.name}</p>
							<p class="text-muted-foreground mt-1 text-sm">
								Debes <strong class="text-foreground">{formatEther(debt)} ETH</strong>
							</p>
						</div>
						<Badge variant="destructive">Pago pendiente</Badge>
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
						class="h-12 w-full gap-2 text-base font-semibold sm:w-auto sm:min-w-64"
						disabled={isPaying || feedback?.phase === "success"}
						onclick={() => pay(entry.org.slug, entry.userStatus.pendingContribution)}
					>
						{#if isPaying}
							<Loader2 class="size-5 animate-spin" />
						{/if}
						Pagar {formatEther(entry.userStatus.pendingContribution)} ETH ahora
					</Button>
				</div>
			{/each}
		{/if}
	</CardContent>
</Card>