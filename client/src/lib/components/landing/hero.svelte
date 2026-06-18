<script lang="ts">
	import { motion } from "motion-sv";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { MorphingText } from "$lib/components/magic/morphing-text/index.js";
	import { ArrowRight, LogIn, Sparkles, ChevronDown } from "@lucide/svelte";
	import { Iridescence } from "svelte-bits";
	import ScrambleHover from "./scramble-hover.svelte";
	import TextRotate from "./text-rotate.svelte";
</script>

<section class="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-24">
	<div class="pointer-events-none absolute inset-0 -z-10">
		<Iridescence
			color={[0.35, 0.45, 0.85]}
			speed={0.6}
			amplitude={0.15}
			class="h-full w-full opacity-25 dark:opacity-30"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-sky-100/30 via-background/50 to-background dark:from-transparent dark:via-background/30"></div>
	</div>

	<motion.div
		initial={{ opacity: 0, y: 30 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
		class="mb-8 flex flex-col items-center gap-6 text-center"
	>
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4, delay: 0.2 }}
		>
			<Badge variant="outline" class="gap-1.5 border-primary/20 bg-primary/5 px-3 py-1 text-xs tracking-wide uppercase">
				<Sparkles class="size-3" />
				<span>Transparent Governance Protocol</span>
			</Badge>
		</motion.div>

		<h1 class="max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
			<span class="text-foreground">Governance That's</span>
			<br />
			<span class="text-gradient-brand">
				<MorphingText
					texts={[
						"Transparent by Design",
						"Secure by Default",
						"Automated by Rule",
						"Verifiable by Anyone"
					]}
				/>
			</span>
		</h1>

		<p class="text-muted-foreground mx-auto max-w-2xl text-balance text-lg leading-relaxed sm:text-xl">
			A system where every member has a <ScrambleHover text="verified identity" class="font-semibold text-foreground" />,
			every vote is final, and every fund movement is <ScrambleHover text="permanently recorded" class="font-semibold text-foreground" />.
			<br />
			<motion.span
				class="inline-block pt-2"
				animate={{ opacity: [0.5, 1, 0.5] }}
				transition={{ duration: 2, repeat: Infinity }}
			>
				Built for <ScrambleHover text="real organizations" class="font-semibold text-foreground" />
			</motion.span>
		</p>

		<motion.div
			class="flex items-center gap-2 text-sm text-muted-foreground"
			animate={{ y: [0, -3, 0] }}
			transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
		>
			<span class="text-xs uppercase tracking-wider">Trusted by</span>
			<TextRotate
				texts={["communities", "cooperatives", "associations", "organizations"]}
				interval={2000}
				class="text-primary font-semibold"
			/>
		</motion.div>
	</motion.div>

	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
		class="flex flex-wrap items-center justify-center gap-4"
	>
		<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
			<Button size="lg" href="/dashboard" class="gap-2 px-6 text-base">
				Explore the Protocol
				<ArrowRight class="size-4" />
			</Button>
		</motion.div>
		<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
			<Button size="lg" variant="outline" href="/dashboard" class="gap-2 px-6 text-base">
				<LogIn class="size-4" />
				Sign In
			</Button>
		</motion.div>
	</motion.div>

	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 0.6, delay: 1 }}
		class="absolute bottom-8 flex flex-col items-center gap-2"
	>
		<motion.span
			class="text-muted-foreground/50 text-xs tracking-widest uppercase"
			animate={{ opacity: [0.3, 0.7, 0.3] }}
			transition={{ duration: 2, repeat: Infinity }}
		>
			Scroll
		</motion.span>
		<motion.div
			animate={{ y: [0, 6, 0] }}
			transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
		>
			<ChevronDown class="text-muted-foreground/50 size-4" />
		</motion.div>
	</motion.div>
</section>
