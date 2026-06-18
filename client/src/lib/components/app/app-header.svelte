<script lang="ts">
	import { Gem, Landmark, LayoutDashboard } from "@lucide/svelte";
	import { page } from "$app/state";

	const navLinks = [
		{ label: "Discover", href: "/discover", icon: Landmark },
		{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
	];
</script>

<header class="border-b border-border/80 bg-background/95 sticky top-0 z-50 backdrop-blur-xl">
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
		<a href="/" class="flex items-center gap-2.5">
			<div class="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
				<Gem class="size-4" />
			</div>
			<span class="text-sm font-semibold tracking-tight">Crystal Lens</span>
		</a>

		<nav class="flex items-center gap-1">
			{#each navLinks as link}
				{@const isActive = page.url.pathname.startsWith(link.href)}
				<a
					href={link.href}
					class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors {isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}"
				>
					<svelte:component this={link.icon} class="size-4" />
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-3">
			<appkit-button></appkit-button>
		</div>
	</div>
</header>
