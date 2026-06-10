<script lang="ts">
	import { onMount } from "svelte";
	import { Moon, Sun } from "@lucide/svelte";
	import { motion } from "motion-sv";

	let mode = $state<"light" | "dark">("light");

	function applyMode(m: "light" | "dark") {
		mode = m;
		document.documentElement.classList.toggle("dark", m === "dark");
		localStorage.setItem("theme", m);
	}

	function toggle() {
		applyMode(mode === "dark" ? "light" : "dark");
	}

	onMount(() => {
		const stored = localStorage.getItem("theme");
		if (stored === "dark" || stored === "light") {
			applyMode(stored);
		} else {
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			applyMode(prefersDark ? "dark" : "light");
		}
	});
</script>

<button
	onclick={toggle}
	class="text-muted-foreground hover:text-foreground hover:bg-accent flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors"
	aria-label="Toggle dark mode"
	type="button"
>
	<motion.span
		animate={{ rotate: mode === "dark" ? 180 : 0 }}
		transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
	>
		{#if mode === "dark"}
			<Moon class="size-4" />
		{:else}
			<Sun class="size-4" />
		{/if}
	</motion.span>
</button>
