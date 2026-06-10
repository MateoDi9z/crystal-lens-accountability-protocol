<script lang="ts">
	import { motion } from "motion-sv";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Gem } from "@lucide/svelte";
</script>

<footer class="border-t px-4 py-12">
	<div class="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
		<motion.a
			href="/"
			class="flex items-center gap-2 text-lg font-semibold tracking-tight"
			whileHover={{ scale: 1.05 }}
		>
			<motion.div
				animate={{ rotate: [0, 5, -5, 0] }}
				transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
			>
				<Gem class="size-5" />
			</motion.div>
			Crystal Lens
		</motion.a>
		<p class="text-muted-foreground max-w-md text-sm leading-relaxed">
			Accountability Protocol — transparent governance infrastructure for organizations.
		</p>
		<Separator class="max-w-xs" />
		<p class="text-muted-foreground/50 text-xs">
			&copy; {new Date().getFullYear()} Crystal Lens Accountability Protocol
		</p>
	</div>
</footer>
