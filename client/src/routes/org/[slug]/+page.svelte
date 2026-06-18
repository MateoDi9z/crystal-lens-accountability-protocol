<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import AppHeader from "$lib/components/app/app-header.svelte";
	import TreasuryCard from "$lib/components/app/treasury-card.svelte";
	import MembersList from "$lib/components/app/members-list.svelte";
	import ProposalsList from "$lib/components/app/proposals-list.svelte";
	import { getOrg } from "$lib/config/orgs";
	import { setActiveOrg, getDashboardState } from "$lib/stores/dashboard.svelte";
	import { getTreasuryOverview, getMembers, getProposals, getUserStatus, resolveOrgAddresses } from "$lib/contracts/read";
	import { governanceAbi } from "$lib/contracts/abi";
	import { publicClient } from "$lib/web3/client";
	import { Loader2, ShieldAlert } from "@lucide/svelte";
	import type { TreasuryOverview, Member, Proposal, UserStatus } from "$lib/contracts/types";
	import type { Address } from "viem";

	const slug = $derived(page.params.slug);
	const org = $derived(slug ? getOrg(slug) : undefined);
	const dashboard = getDashboardState();

	let loading = $state(true);
	let error = $state<string | null>(null);

	let treasury = $state<TreasuryOverview | null>(null);
	let members = $state<Member[]>([]);
	let proposals = $state<Proposal[]>([]);
	let userStatus = $state<UserStatus | undefined>(undefined);
	let votes = $state<Record<string, boolean>>({});

	async function loadOrgData() {
		if (!org) {
			error = "Organization not found";
			loading = false;
			return;
		}

		loading = true;
		error = null;

		// Sync active organization in global store
		setActiveOrg(org);

		try {
			// Fetch main public contract details
			const [tData, mData, pData] = await Promise.all([
				getTreasuryOverview(org),
				getMembers(org),
				getProposals(org)
			]);

			treasury = tData;
			members = mData;
			proposals = pData;

			// If a wallet is connected, load user status and voting flags
			if (dashboard.address) {
				const uStatus = await getUserStatus(org, dashboard.address);
				userStatus = uStatus;

				if (pData.length > 0) {
					const { governance } = await resolveOrgAddresses(org);
					const voteStatusMap: Record<string, boolean> = {};

					await Promise.all(
						pData.map(async (p) => {
							try {
								const hasVoted = await publicClient.readContract({
									address: governance,
									abi: governanceAbi,
									functionName: "voted",
									args: [p.id, dashboard.address as Address]
								});
								if (hasVoted) {
									voteStatusMap[p.id.toString()] = true;
								}
							} catch {
								// Ignore individual log errors
							}
						})
					);
					votes = voteStatusMap;
				}
			} else {
				userStatus = undefined;
				votes = {};
			}

			loading = false;
		} catch (err: any) {
			console.error("Error loading organization data:", err);
			error = "Failed to load contract information from the Sepolia network.";
			loading = false;
		}
	}

	// Trigger reload whenever slug changes or wallet connects/disconnects
	$effect(() => {
		if (slug || dashboard.address) {
			loadOrgData();
		}
	});

	onMount(() => {
		loadOrgData();
	});
</script>

<svelte:head>
	<title>{org ? org.name : "Organization Details"} | Crystal Lens</title>
</svelte:head>

<AppHeader />

<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
	{#if !org}
		<div class="bg-destructive/10 text-destructive flex flex-col items-center justify-center rounded-2xl p-8 text-center">
			<ShieldAlert class="mb-2 size-8" />
			<h2 class="text-lg font-bold">Organization Not Found</h2>
			<p class="mt-1 text-sm">The organization slug "{slug}" is not configured.</p>
			<a href="/discover" class="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-xl px-4 py-2 text-sm font-medium transition-colors">
				Back to Discover
			</a>
		</div>
	{:else if loading}
		<div class="flex min-h-[400px] flex-col items-center justify-center gap-3">
			<Loader2 class="text-primary size-8 animate-spin" />
			<p class="text-muted-foreground text-sm">Syncing with Sepolia testnet...</p>
		</div>
	{:else if error}
		<div class="bg-destructive/10 text-destructive flex flex-col items-center justify-center rounded-2xl p-8 text-center">
			<ShieldAlert class="mb-2 size-8" />
			<h2 class="text-lg font-bold">Network Sync Failure</h2>
			<p class="mt-1 text-sm">{error}</p>
			<button onclick={loadOrgData} class="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-xl px-4 py-2 text-sm font-medium transition-colors">
				Retry Sync
			</button>
		</div>
	{:else}
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">{org.name}</h1>
				<p class="text-muted-foreground mt-1 text-sm">{org.description}</p>
			</div>
			<div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				Slug: <span class="bg-muted text-foreground rounded-full px-2.5 py-0.5">{org.slug}</span>
			</div>
		</div>

		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Left Column: Treasury and Member details -->
			<div class="space-y-6 lg:col-span-1">
				{#if treasury}
					<TreasuryCard {treasury} />
				{/if}
				<MembersList {members} />
			</div>

			<!-- Right Column: Proposals list -->
			<div class="lg:col-span-2">
				<ProposalsList {proposals} user={userStatus} {votes} />
			</div>
		</div>
	{/if}
</main>
