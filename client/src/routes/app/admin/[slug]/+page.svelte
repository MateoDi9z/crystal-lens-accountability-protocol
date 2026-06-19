<script lang="ts">
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ConnectPrompt from "$lib/components/app/connect-prompt.svelte";
	import NetworkWarning from "$lib/components/app/network-warning.svelte";
	import OwnerPanel from "$lib/components/app/owner-panel.svelte";
	import OrgContractsInfo from "$lib/components/app/org-contracts-info.svelte";
	import { ArrowLeft, AlertCircle, Crown } from "@lucide/svelte";
	import { appPaths } from "$lib/config/paths";
	import { getOrg } from "$lib/config/orgs";
	import {
		getDashboardState,
		refreshAllOrgsDashboard
	} from "$lib/stores/dashboard.svelte";

	const dashboard = getDashboardState();

	const slug = $derived(page.params.slug ?? "");
	const org = $derived(slug ? getOrg(slug) : undefined);
	const owned = $derived(
		org ? dashboard.ownedOrgsData.find((entry) => entry.org.slug === org.slug) : undefined
	);

	onMount(() => {
		if (dashboard.address) {
			refreshAllOrgsDashboard(dashboard.address);
		}
	});
</script>

<svelte:head>
	<title>{org ? `Administrar ${org.name} — Crystal Lens` : "Administración — Crystal Lens"}</title>
	<meta
		name="description"
		content={org?.description ?? "Administrá una organización en Crystal Lens."}
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
	<Button variant="ghost" size="sm" href={appPaths.admin} class="mb-6 gap-1.5">
		<ArrowLeft class="size-4" />
		Volver a mis organizaciones
	</Button>

	{#if !dashboard.isConnected}
		<ConnectPrompt />
	{:else}
		{#if dashboard.isWrongNetwork}
			<div class="mb-6">
				<NetworkWarning />
			</div>
		{/if}

		{#if !org}
			<div class="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4">
				<AlertCircle class="text-destructive mt-0.5 size-5 shrink-0" />
				<div>
					<p class="font-medium">Organización no encontrada</p>
					<p class="text-muted-foreground mt-1 text-sm">
						El enlace no corresponde a ninguna organización configurada.
					</p>
				</div>
			</div>
		{:else if dashboard.loadingAllOrgs}
			<div class="space-y-4">
				<div class="bg-muted/50 h-10 w-48 animate-pulse rounded-lg"></div>
				<div class="bg-muted/50 h-96 animate-pulse rounded-2xl"></div>
			</div>
		{:else if !owned}
			<div class="border-amber-500/30 bg-amber-500/5 flex items-start gap-3 rounded-xl border p-4">
				<AlertCircle class="mt-0.5 size-5 shrink-0 text-amber-600" />
				<div>
					<p class="font-medium">Sin permisos de administración</p>
					<p class="text-muted-foreground mt-1 text-sm">
						Tu billetera no es dueña de <strong>{org.name}</strong>. Conectate con la cuenta del
						dueño para administrar esta organización.
					</p>
					<Button variant="outline" size="sm" href={appPaths.admin} class="mt-4">
						Ver mis organizaciones
					</Button>
				</div>
			</div>
		{:else}
			<div class="mb-8">
				<Badge variant="secondary" class="mb-3 gap-1">
					<Crown class="size-3" />
					Administración
				</Badge>
				<div class="flex items-center gap-2">
					<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{org.name}</h1>
					<OrgContractsInfo {org} />
				</div>
				<p class="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed sm:text-base">
					{org.description}
				</p>
			</div>

			<OwnerPanel
				org={owned.org}
				members={owned.members}
				proposals={owned.proposals}
				userAddress={dashboard.address!}
			/>
		{/if}
	{/if}
</div>