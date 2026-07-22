<script lang="ts">
	import { motion } from "motion-sv";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { ShieldCheck, Ban, Scale, Box, ScrollText, Lock, Zap, Sparkles } from "@lucide/svelte";
	import ScrambleHover from "./scramble-hover.svelte";

	const features = [
		{ icon: Ban, title: "Non-Transferable", desc: "Memberships are personal. They can't be sold, transferred, or delegated." },
		{ icon: Scale, title: "Majority Rule", desc: "Proposals are approved when a majority agrees. No waiting for arbitrary deadlines." },
		{ icon: ShieldCheck, title: "Secure by Design", desc: "Funds are protected by multiple layers of verification before any release." },
		{ icon: Box, title: "One Organization, One Deploy", desc: "Each organization gets its own independent system, completely isolated." },
		{ icon: ScrollText, title: "Member Data Stored", desc: "Real names and identification are registered with each membership." },
		{ icon: Lock, title: "Clear Permissions", desc: "Simple roles — administrators manage members, the group controls funds." },
		{ icon: Zap, title: "Instant Execution", desc: "Approved proposals execute immediately. No manual steps, no delays." },
		{ icon: Sparkles, title: "Fully Auditable", desc: "Every action is recorded in a permanent history anyone can verify." },
	];
</script>

<section class="relative px-4 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl">
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
			inViewOptions={{ once: true, margin: "-100px" }}
			class="mb-16 text-center"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				whileInView={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
				inViewOptions={{ once: true }}
			>
				<Badge variant="secondary" class="mb-4">Why CLAP</Badge>
			</motion.div>
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
				Built for
				<span class="text-gradient-brand">
					Clarity
				</span>
				<motion.span
					class="ml-2 inline-block"
					animate={{ rotate: [0, 5, -5, 0] }}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<Sparkles class="inline size-7 text-amber-400" />
				</motion.span>
			</h2>
		</motion.div>

		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each features as feature, i}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					whileInView={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
					inViewOptions={{ once: true, margin: "-50px" }}
				>
					<motion.div
						whileHover={{ x: 3, scale: 1.02 }}
						class="border-border/80 bg-card/70 hover:border-primary/25 hover:bg-card flex items-start gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-transparent dark:shadow-none dark:hover:bg-transparent"
					>
						<feature.icon class="text-primary mt-0.5 size-4 shrink-0" />
						<div>
							<h4 class="text-sm font-medium">{feature.title}</h4>
							<p class="text-muted-foreground mt-0.5 text-xs leading-relaxed">{feature.desc}</p>
						</div>
					</motion.div>
				</motion.div>
			{/each}
		</div>
	</div>
</section>
