<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { motion } from "motion-sv";
	import { Gem, LogIn, ArrowRight } from "@lucide/svelte";
	import ModeToggle from "./mode-toggle.svelte";

	const links = [
		{ label: "About", href: "#about" },
		{ label: "How it Works", href: "#how-it-works" },
		{ label: "Architecture", href: "#architecture" },
		{ label: "Features", href: "#features" }
	];

	let scrolled = $state(false);

	function onScroll() {
		scrolled = window.scrollY > 20;
	}
</script>

<svelte:window onscroll={onScroll} />

<header
	class={scrolled ? "fixed top-0 right-0 left-0 z-50 border-b bg-background/80 backdrop-blur-xl transition-all duration-300" : "fixed top-0 right-0 left-0 z-50 border-transparent bg-background/0 transition-all duration-300"}
>
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
		<a
			href="/"
			class="group flex items-center gap-2.5"
		>
			<motion.div
				class="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg transition-colors group-hover:bg-primary/20"
				whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
				transition={{ duration: 0.3 }}
			>
				<Gem class="size-4" />
			</motion.div>
			<span class="hidden text-sm font-semibold tracking-tight sm:block">Crystal Lens</span>
		</a>

		<nav class="hidden items-center gap-1 md:flex">
			{#each links as link}
				<a
					href={link.href}
					class="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-2">
			<ModeToggle />
			<div class="bg-border mx-1 hidden h-5 w-px sm:block"></div>
			<Button variant="ghost" size="sm" class="hidden sm:inline-flex gap-1.5" disabled>
				<LogIn class="size-3.5" />
				Sign In
			</Button>
			<Button size="sm" class="gap-1.5">
				Get Started
				<ArrowRight class="size-3.5" />
			</Button>
		</div>
	</div>
</header>
