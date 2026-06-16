<script lang="ts">
	import { motion } from "motion-sv";
	import { Badge } from "$lib/components/ui/badge/index.js";

	const steps = [
		{
			step: "01",
			title: "Set Up Your Organization",
			desc: "An organization deploys its governance system with membership registration, a shared treasury, and a voting framework — all configured in one coordinated setup.",
			highlights: ["Identity registration", "Treasury setup", "Voting rules"]
		},
		{
			step: "02",
			title: "Register Members & Contributions",
			desc: "Members receive their verified identity and are assigned a contribution. Only those who have paid their contribution can participate in decisions.",
			highlights: ["Verified identity", "Contribution tracking", "Voter eligibility"]
		},
		{
			step: "03",
			title: "Propose & Vote",
			desc: "Any authorized member can create a proposal describing how funds should be used. Members vote for or against. Once a majority is reached, the result is instant.",
			highlights: ["Create proposals", "Majority voting", "Instant resolution"]
		},
		{
			step: "04",
			title: "Funds Are Released",
			desc: "Approved proposals trigger the release of funds automatically. The entire process — from proposal to execution — is recorded permanently.",
			highlights: ["Automatic release", "Permanent record", "Full audit trail"]
		}
	];
</script>

<section class="section-surface relative px-4 py-24 sm:py-32">
	<div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
		<div
			class="absolute left-1/2 top-1/3 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[120px]"
			style="background: radial-gradient(circle, oklch(0.6 0.2 250), transparent 70%)"
		></div>
	</div>

	<div class="mx-auto max-w-6xl">
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
			viewport={{ once: true, margin: "-100px" }}
			class="mb-16 text-center"
		>
			<Badge variant="secondary" class="mb-4">How It Works</Badge>
			<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
				From Setup to
				<span class="text-gradient-brand">
					Execution
				</span>
			</h2>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
				Four steps. Three modules. Zero middlemen.
			</p>
		</motion.div>

		<div class="relative">
			<div class="bg-border absolute left-8 top-0 hidden h-full w-px md:block lg:left-12" aria-hidden="true"></div>

			<div class="space-y-16 md:space-y-24">
				{#each steps as s, i}
					<motion.div
						initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
						viewport={{ once: true, margin: "-80px" }}
						class="relative flex flex-col gap-6 md:flex-row md:gap-10"
					>
						<div class="flex shrink-0 items-start gap-4 md:w-48 md:flex-col md:gap-2">
							<motion.div
								class="bg-card text-foreground relative z-10 flex size-16 shrink-0 items-center justify-center rounded-xl border border-border/80 text-lg font-bold shadow-sm md:size-20 md:text-2xl dark:shadow-xs"
								whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
								transition={{ duration: 0.3 }}
							>
								<div
									class="pointer-events-none absolute -inset-[2px] -z-10 rounded-xl opacity-50"
									style="background: linear-gradient(135deg, oklch(0.6 0.2 250), oklch(0.5 0.2 190), oklch(0.55 0.25 280));"
								></div>
								{s.step}
							</motion.div>
							<div class="md:hidden">
								<h3 class="text-lg font-semibold">{s.title}</h3>
							</div>
						</div>

						<div class="pt-0 md:pt-5">
							<h3 class="mb-3 hidden text-xl font-semibold md:block">{s.title}</h3>
							<p class="text-muted-foreground mb-4 max-w-xl text-base leading-relaxed">
								{s.desc}
							</p>
							<div class="flex flex-wrap gap-2">
								{#each s.highlights as highlight, j}
									<motion.div
										initial={{ opacity: 0, x: -10 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: 0.2 + j * 0.08 }}
										viewport={{ once: true }}
									>
										<Badge variant="secondary" class="text-xs">{highlight}</Badge>
									</motion.div>
								{/each}
							</div>
						</div>
					</motion.div>
				{/each}
			</div>
		</div>
	</div>
</section>
