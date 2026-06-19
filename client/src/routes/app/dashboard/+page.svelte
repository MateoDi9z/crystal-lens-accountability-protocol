<script lang="ts">
	import { onMount } from "svelte";
	import ConnectPrompt from "$lib/components/app/connect-prompt.svelte";
	import NetworkWarning from "$lib/components/app/network-warning.svelte";
	import PendingContributions from "$lib/components/app/pending-contributions.svelte";
	import GovernanceSection from "$lib/components/app/governance-section.svelte";
	import MyOrganizationsPanel from "$lib/components/app/my-organizations-panel.svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import DashboardSkeleton from "$lib/components/app/dashboard-skeleton.svelte";
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
</script>

<svelte:head>
	<title>Mi Dashboard — Crystal Lens</title>
	<meta
		name="description"
		content="Pagá tus contribuciones y participá en la gobernanza de tus organizaciones."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
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

		<div class="flex flex-col gap-6 lg:flex-row lg:items-start">
			<div class="min-w-0 flex-1">
				{#if dashboard.loadingAllOrgs}
					<DashboardSkeleton />
				{:else}
					<div class="space-y-6">
						<PendingContributions />
						<GovernanceSection />
					</div>
				{/if}
			</div>

			<aside class="w-full shrink-0 lg:w-72 xl:w-80">
				<MyOrganizationsPanel />
			</aside>
		</div>
	{/if}
</div>