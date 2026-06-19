<script lang="ts">
	import { page } from "$app/state";
	import { motion } from "motion-sv";
	import { Gem } from "@lucide/svelte";
	import { formatEther } from "viem";
	import ModeToggle from "$lib/components/landing/mode-toggle.svelte";
	import { onMount } from "svelte";
	import { appPaths } from "$lib/config/paths";
	import { getDashboardState } from "$lib/stores/dashboard.svelte";
	import { initWeb3 } from "$lib/web3/init";

	const dashboard = getDashboardState();

	const links = [
		{ label: "Discover", href: appPaths.discover },
		{ label: "Dashboard", href: appPaths.dashboard },
		{ label: "Administración", href: appPaths.admin }
	];

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function formatEthShort(wei: bigint) {
		return Number.parseFloat(formatEther(wei)).toFixed(2);
	}

	onMount(() => {
		void initWeb3();
	});
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 border-b border-border/60 bg-background/75 shadow-sm backdrop-blur-xl dark:border-border dark:shadow-none"
>
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
		<a href="/" class="group flex items-center gap-2.5">
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
				{#if dashboard.sepoliaBalanceLoading}
					<span class="text-muted-foreground hidden text-xs sm:inline">…</span>
				{:else if dashboard.sepoliaEthBalance !== null}
					<span
						class="bg-muted/60 text-muted-foreground hidden rounded-md px-2 py-1 font-mono text-xs sm:inline"
						title="Balance en Sepolia"
					>
						{formatEthShort(dashboard.sepoliaEthBalance)} ETH
					</span>
				{/if}
			{/if}

			<appkit-button balance="hide"></appkit-button>
		</div>
	</div>
</header>