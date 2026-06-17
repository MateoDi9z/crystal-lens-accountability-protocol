<script lang="ts">
	import { motion } from "motion-sv";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { ShieldCheck, IdCard, Banknote, Vote } from "@lucide/svelte";
	import ScrambleHover from "./scramble-hover.svelte";

	const pillars = [
		{
			icon: IdCard,
			title: "Membership",
			tag: "Verified Identity",
			description:
				"A secure, non-transferable identity that represents belonging to the organization. Each member's information is registered and cannot be duplicated or transferred.",
			details: [
				"Non-transferable membership",
				"Real identity registration",
				"Admin-managed roster"
			],
			gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
			iconColor: "text-sky-600 dark:text-sky-400",
			iconBg: "bg-sky-500/10 dark:bg-foreground/5"
		},
		{
			icon: Banknote,
			title: "Treasury",
			tag: "Shared Funds",
			description:
				"The treasury holds all organization funds and tracks each member's contributions. Money only moves when the group collectively agrees through a vote.",
			details: [
				"Contribution tracking",
				"Secure fund custody",
				"Vote-controlled spending"
			],
			gradient: "from-teal-500/15 via-teal-500/5 to-transparent",
			iconColor: "text-teal-600 dark:text-teal-400",
			iconBg: "bg-teal-500/10 dark:bg-foreground/5"
		},
		{
			icon: Vote,
			title: "Governance",
			tag: "Decisions",
			description:
				"Members create and vote on proposals. When a majority agrees, the outcome is executed immediately — no delays, no manual steps.",
			details: [
				"Proposal system",
				"Majority-based voting",
				"Automatic execution"
			],
			gradient: "from-indigo-500/15 via-indigo-500/5 to-transparent",
			iconColor: "text-indigo-600 dark:text-indigo-400",
			iconBg: "bg-indigo-500/10 dark:bg-foreground/5"
		}
	];
</script>

<section class="relative px-4 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl">
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
			viewport={{ once: true, margin: "-100px" }}
			class="mb-16 text-center"
		>
			<Badge variant="secondary" class="mb-4">Architecture</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
				Three Modules,
				<span class="text-gradient-brand">
					One Organization
				</span>
			</h2>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
				Each organization uses
				<ScrambleHover text="three connected modules" class="font-semibold text-foreground" />
				that work together seamlessly.
			</p>
		</motion.div>

		<div class="grid gap-8 lg:grid-cols-3">
			{#each pillars as pillar, i}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true, margin: "-80px" }}
					whileHover={{ y: -4 }}
					class="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-8 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md dark:bg-transparent dark:shadow-none dark:hover:border-border"
				>
					<div
						class="pointer-events-none absolute inset-0 bg-linear-to-b {pillar.gradient} opacity-80"
						aria-hidden="true"
					></div>
					<motion.div
						class="{pillar.iconBg} relative mb-6 flex size-14 items-center justify-center rounded-xl"
						whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
						transition={{ duration: 0.3 }}
					>
						<pillar.icon class="{pillar.iconColor} size-7" />
					</motion.div>

					<Badge variant="outline" class="relative mb-4 w-fit text-xs">{pillar.tag}</Badge>

					<h3 class="relative mb-3 text-xl font-semibold">{pillar.title}</h3>
					<p class="text-muted-foreground relative mb-6 flex-1 text-sm leading-relaxed">
						{pillar.description}
					</p>

					<ul class="relative space-y-2">
						{#each pillar.details as detail}
							<li class="flex items-center gap-2 text-sm">
								<ShieldCheck class="size-3.5 shrink-0 text-green-500" />
								<span>{detail}</span>
							</li>
						{/each}
					</ul>
				</motion.div>
			{/each}
		</div>
	</div>
</section>
