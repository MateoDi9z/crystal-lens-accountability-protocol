<script lang="ts">
	import { motion } from "motion-sv";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { ArrowRight, Sparkles } from "@lucide/svelte";
	import { appPaths } from "$lib/config/paths";
	import { Orb } from "svelte-bits";
	import TextRotate from "./text-rotate.svelte";
</script>

<section class="relative overflow-hidden px-4 py-24 sm:py-32">
	<div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
		<div class="h-full w-full opacity-20 dark:opacity-20">
			<Orb
				hue={230}
				hoverIntensity={0.3}
				rotateOnHover={false}
				forceHoverState={true}
			/>
		</div>
		<div class="absolute inset-0 bg-gradient-to-b from-indigo-100/20 via-background/60 to-background dark:from-transparent dark:via-background/40"></div>
	</div>

	<motion.div
		initial={{ opacity: 0, scale: 0.95 }}
		whileInView={{ opacity: 1, scale: 1 }}
		transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
		inViewOptions={{ once: true, margin: "-100px" }}
		class="mx-auto max-w-3xl text-center"
	>
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.1 }}
			inViewOptions={{ once: true }}
		>
			<Badge variant="outline" class="mb-4 gap-1.5">
				<Sparkles class="size-3" />
				<span>Crystal Lens Protocol</span>
			</Badge>
		</motion.div>

		<h2 class="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
			Ready to Make Your Organization
			<br />
			<span class="text-gradient-brand">
				Crystal Clear
			</span>?
		</h2>

		<motion.p
			class="text-muted-foreground mx-auto mb-10 max-w-xl text-lg leading-relaxed"
			animate={{ opacity: [0.7, 1, 0.7] }}
			transition={{ duration: 3, repeat: Infinity }}
		>
			Join{" "}
			<TextRotate
				texts={["communities", "cooperatives", "associations", "organizations"]}
				interval={2500}
				class="font-semibold text-foreground"
			/>
			{" "}already building trust with CLAP.
		</motion.p>

		<motion.div
			class="flex flex-wrap items-center justify-center gap-4"
			initial={{ opacity: 0, y: 10 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.2 }}
			inViewOptions={{ once: true }}
		>
			<motion.div whileHover={{ scale: 1.05 }} whilePress={{ scale: 0.95 }}>
				<Button size="lg" href={appPaths.discover} class="gap-2 px-8 text-base">
					Enter App
					<ArrowRight class="size-4" />
				</Button>
			</motion.div>
		</motion.div>


	</motion.div>
</section>
