<script lang="ts">
	import { onMount } from "svelte";
	import AppHeader from "$lib/components/app/app-header.svelte";
	import { getAllOrgs } from "$lib/config/orgs";
	import { getTreasuryOverview } from "$lib/contracts/read";
	import { formatEther } from "viem";
	import { Landmark, Users, Coins, ShieldAlert, Loader2 } from "@lucide/svelte";
	import type { OrgConfig } from "$lib/config/orgs";
	import type { TreasuryOverview } from "$lib/contracts/types";

	interface OrgWithOverview {
		config: OrgConfig;
		overview: TreasuryOverview | null;
		loading: boolean;
		error: string | null;
	}

	let orgsList = $state<OrgWithOverview[]>([]);

	onMount(() => {
		const configs = getAllOrgs();
		orgsList = configs.map((config) => ({
			config,
			overview: null,
			loading: true,
			error: null
		}));

		orgsList.forEach(async (item, index) => {
			try {
				const overview = await getTreasuryOverview(item.config);
				orgsList[index].overview = overview;
				orgsList[index].loading = false;
			} catch (err: any) {
				console.error(`Error loading overview for ${item.config.name}:`, err);
				orgsList[index].error = "Unable to fetch contract details";
				orgsList[index].loading = false;
			}
		});
	});
</script>

<svelte:head>
	<title>Discover Organizations | Crystal Lens</title>
</svelte:head>

<AppHeader />

<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Discover Organizations</h1>
		<p class="text-muted-foreground mt-2">
			Audit on-chain financial balances, memberships, and community proposals.
		</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each orgsList as item}
			<div class="bg-card text-card-foreground border-border/80 flex flex-col justify-between rounded-2xl border p-6 transition-all hover:shadow-md">
				<div>
					<div class="flex items-start justify-between gap-4">
						<h2 class="text-xl font-bold tracking-tight">{item.config.name}</h2>
						<span class="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
							{item.config.slug}
						</span>
					</div>

					<p class="text-muted-foreground mt-3 text-sm leading-relaxed min-h-[48px]">
						{item.config.description}
					</p>

					<div class="border-border/60 my-6 border-t"></div>

					{#if item.loading}
						<div class="flex h-24 items-center justify-center">
							<Loader2 class="text-muted-foreground size-6 animate-spin" />
						</div>
					{:else if item.error}
						<div class="bg-destructive/10 text-destructive flex h-24 flex-col items-center justify-center rounded-xl p-4 text-center text-xs">
							<ShieldAlert class="mb-1.5 size-5" />
							{item.error}
						</div>
					{:else if item.overview}
						<div class="grid grid-cols-2 gap-4">
							<div class="bg-muted/30 rounded-xl p-3">
								<div class="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold">
									<Coins class="size-3.5" /> Funds
								</div>
								<p class="text-sm font-bold truncate">
									{formatEther(item.overview.totalFunds)} ETH
								</p>
							</div>
							<div class="bg-muted/30 rounded-xl p-3">
								<div class="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold">
									<Users class="size-3.5" /> Members
								</div>
								<p class="text-sm font-bold truncate">
									{item.overview.contributorCount.toString()}
								</p>
							</div>
						</div>
					{/if}
				</div>

				<div class="mt-6">
					<a
						href="/org/{item.config.slug}"
						class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-medium transition-colors"
					>
						View Organization
					</a>
				</div>
			</div>
		{/each}
	</div>
</main>
