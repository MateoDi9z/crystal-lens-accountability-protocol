<script lang="ts">
	import { motion } from "motion-sv";

	let {
		texts = [],
		interval = 2500,
		class: className = ""
	}: {
		texts?: string[];
		interval?: number;
		class?: string;
	} = $props();

	let currentIndex = $state(0);
	let isVisible = $state(true);

	let rotateInterval: ReturnType<typeof setInterval> | undefined;

	function startRotation() {
		rotateInterval = setInterval(() => {
			isVisible = false;
			setTimeout(() => {
				currentIndex = (currentIndex + 1) % texts.length;
				isVisible = true;
			}, 300);
		}, interval);
	}

	function stopRotation() {
		clearInterval(rotateInterval);
	}

	$effect(() => {
		startRotation();
		return stopRotation;
	});
</script>

<span class="inline-block">
	<motion.span
		class={className}
		animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
		transition={{ duration: 0.3 }}
	>
		{texts[currentIndex] || ""}
	</motion.span>
</span>
