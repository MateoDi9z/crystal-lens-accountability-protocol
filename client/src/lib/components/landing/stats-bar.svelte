<script lang="ts">
	import { motion } from "motion-sv";

	const stats = [
		{ value: "100%", label: "Transparent" },
		{ value: "3", label: "Core Modules" },
		{ value: "1", label: "Member = 1 Vote" },
		{ value: "Auto", label: "Execution" }
	];
</script>

<section class="border-y px-4 py-12">
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-2 gap-8 md:grid-cols-4">
			{#each stats as stat, i}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: i * 0.1 }}
					viewport={{ once: true }}
					class="text-center"
				>
					<motion.div
						class="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
						whileInView={{ scale: [1, 1.1, 1] }}
						transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
						viewport={{ once: true }}
					>
						{stat.value}
					</motion.div>
					<div class="text-muted-foreground mt-1 text-sm">{stat.label}</div>
				</motion.div>
			{/each}
		</div>
	</div>
</section>
