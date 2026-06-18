<script lang="ts">
	import { onMount } from "svelte";
	import ConnectPrompt from "$lib/components/app/connect-prompt.svelte";
	import NetworkWarning from "$lib/components/app/network-warning.svelte";
	import PendingContributions from "$lib/components/app/pending-contributions.svelte";
	import GovernanceSection from "$lib/components/app/governance-section.svelte";
	import OwnerPanel from "$lib/components/app/owner-panel.svelte";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Loader2 } from "@lucide/svelte";
	import {
		getDashboardState,
		refreshAllOrgsDashboard
	} from "$lib/stores/dashboard.svelte";

	const dashboard = getDashboardState();

	onMount(() => {
		if (dashboard.address) {
			refreshAllOrgsDashboard(dashboard.address);
		}
	});

	function shortAddress(address: string) {
		return `${address.slice(0, 6)}…${address.slice(-4)}`;
	}
</script>

<svelte:head>
	<title>Mi Dashboard — Crystal Lens</title>
	<meta
		name="description"
		content="Pagá tus contribuciones y participá en la gobernanza de tus organizaciones."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
	<div class="mb-8">
		<Badge variant="secondary" class="mb-3">Personal</Badge>
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Mi Dashboard</h1>
		<p class="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
			Gestioná tus pagos y participá en las decisiones de tus organizaciones.
		</p>
	</div>

	{#if !dashboard.isConnected}
		<ConnectPrompt />
	{:else}
		{#if dashboard.isWrongNetwork}
			<div class="mb-6">
				<NetworkWarning />
			</div>
		{/if}

		{#if dashboard.loadingAllOrgs}
			<div class="text-muted-foreground flex items-center gap-2 py-12 text-sm">
				<Loader2 class="size-4 animate-spin" />
				Cargando tu información…
			</div>
		{:else}
			{#if dashboard.ownedOrgsData.length > 0}
				<Tabs.Root value="contributor" class="w-full">
					<Tabs.List class="grid w-full grid-cols-2 mb-6">
						<Tabs.Trigger value="contributor">Panel de Contribuidor</Tabs.Trigger>
						<Tabs.Trigger value="owner">Administración (Dueño)</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="contributor" class="space-y-6 mt-0">
						<PendingContributions />
						<GovernanceSection />
					</Tabs.Content>
					<Tabs.Content value="owner" class="space-y-6 mt-0">
						{#each dashboard.ownedOrgsData as owned (owned.org.slug)}
							<OwnerPanel org={owned.org} members={owned.members} userAddress={dashboard.address!} />
						{/each}
					</Tabs.Content>
				</Tabs.Root>
			{:else}
				<div class="space-y-6">
					<PendingContributions />
					<GovernanceSection />
				</div>
			{/if}
		{/if}
	{/if}
</div>