<script lang="ts">
	import { page } from "$app/state";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { motion } from "motion-sv";
	import { Gem } from "@lucide/svelte";
	import ModeToggle from "$lib/components/landing/mode-toggle.svelte";
	import { getDashboardState } from "$lib/stores/dashboard.svelte";
	import { appPaths } from "$lib/config/paths";
	import "$lib/web3/appkit";

	const dashboard = getDashboardState();

	const links = [
		{ label: "Discover", href: appPaths.discover },
		{ label: "Dashboard", href: appPaths.dashboard }
	];

	function shortAddress(address?: string) {
		if (!address) return "";
		return `${address.slice(0, 6)}…${address.slice(-4)}`;
	}

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 border-b border-border/60 bg-background/75 shadow-sm backdrop-blur-xl dark:border-border dark:shadow-none"
>
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
		<a href={appPaths.discover} class="group flex items-center gap-2.5">
			<motion.div
				class="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg transition-colors group-hover:bg-primary/20"
				whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
				transition={{ duration: 0.3 }}
			>
				<Gem class="size-4" />
			</motion.div>
			<span class="hidden text-sm font-semibold tracking-tight sm:block">Crystal Lens</span>
		</a>

		<nav class="flex items-center gap-1">
			{#each links as link}
				<a
					href={link.href}
					class={isActive(link.href)
						? "bg-accent text-foreground rounded-md px-3 py-1.5 text-sm font-medium"
						: "text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-2">
			<ModeToggle />
			<div class="bg-border mx-1 hidden h-5 w-px sm:block"></div>

			{#if dashboard.isConnected}
				<Badge variant="secondary" class="hidden gap-1 sm:inline-flex">
					<span class="size-1.5 rounded-full bg-emerald-500"></span>
					Conectado
				</Badge>
				<span class="text-muted-foreground hidden font-mono text-xs lg:inline">
					{shortAddress(dashboard.address)}
				</span>
				<appkit-account-button></appkit-account-button>
			{:else}
				<appkit-connect-button></appkit-connect-button>
			{/if}
		</div>
	</div>
</header>