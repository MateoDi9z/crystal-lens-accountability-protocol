<script lang="ts">
	import { motion } from "motion-sv";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Shield, Fingerprint, Eye, Users } from "@lucide/svelte";

	const values = [
		{
			icon: Fingerprint,
			title: "Verified Identities",
			description:
				"Each member receives a unique, non-transferable digital identity linked to their real information. No impersonation, no duplicates."
		},
		{
			icon: Eye,
			title: "Total Transparency",
			description:
				"Every proposal, vote, contribution, and fund movement is permanently recorded and visible to all members. Nothing happens in the dark."
		},
		{
			icon: Users,
			title: "Fair Voting",
			description:
				"Only members who are up to date with their contributions can vote. One member, one vote. Proposals are approved when a majority agrees."
		},
		{
			icon: Shield,
			title: "Automated Treasury",
			description:
				"Funds are held securely and only released when the group approves it. No single person can move money without collective consent."
		}
	];
</script>

<section class="relative px-4 py-24 sm:py-32">
	<div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
		<motion.div
			class="absolute left-[20%] top-[30%] h-[40%] w-[40%] rounded-full opacity-10 blur-[120px]"
			style="background: radial-gradient(circle, oklch(0.6 0.2 250), transparent 70%)"
			animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
			transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
		></motion.div>
	</div>

	<div class="mx-auto max-w-6xl">
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
			viewport={{ once: true, margin: "-100px" }}
			class="mb-16 text-center"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				whileInView={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3, delay: 0.1 }}
				viewport={{ once: true }}
			>
				<Badge variant="secondary" class="mb-4">What is CLAP</Badge>
			</motion.div>
			<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
				Infrastructure for
				<span class="bg-linear-to-r from-sky-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
					Accountable Organizations
				</span>
			</h2>
			<p class="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed">
				Crystal Lens gives organizations a transparent backbone for managing members,
				contributions, proposals, and funds. It's made of three core modules —
				<strong class="text-foreground">Membership</strong>,
				<strong class="text-foreground">Treasury</strong>, and
				<strong class="text-foreground">Governance</strong> —
				that work together to enforce rules automatically.
			</p>
		</motion.div>

		<div class="grid gap-6 md:grid-cols-2">
			{#each values as value, i}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true, margin: "-80px" }}
				>
					<motion.div
						whileHover={{ y: -4, scale: 1.01 }}
						transition={{ duration: 0.2 }}
						class="h-full"
					>
						<Card class="group h-full transition-shadow duration-300 hover:shadow-lg">
							<CardHeader>
								<motion.div
									class="bg-primary/10 text-primary mb-3 flex size-10 items-center justify-center rounded-lg"
									whileHover={{ rotate: [0, -10, 10, 0] }}
									transition={{ duration: 0.4 }}
								>
									<value.icon class="size-5" />
								</motion.div>
								<CardTitle class="text-lg">{value.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription class="text-sm leading-relaxed">
									{value.description}
								</CardDescription>
							</CardContent>
						</Card>
					</motion.div>
				</motion.div>
			{/each}
		</div>
	</div>
</section>
