<script lang="ts">
	let {
		text = "Hover me",
		class: className = ""
	}: {
		text?: string;
		class?: string;
	} = $props();

	let isHovered = $state(false);
	let scrambled = $state("");

	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

	let interval: ReturnType<typeof setInterval> | undefined;

	function startScramble() {
		isHovered = true;
		scrambled = text;
		let iterations = 0;

		interval = setInterval(() => {
			scrambled = text
				.split("")
				.map((char, i) => {
					if (char === " ") return " ";
					if (i < iterations) return text[i];
					return chars[Math.floor(Math.random() * chars.length)];
				})
				.join("");

			iterations += 1;
			if (iterations >= text.length) {
				clearInterval(interval);
				scrambled = text;
			}
		}, 60);
	}

	function stopScramble() {
		isHovered = false;
		clearInterval(interval);
		scrambled = "";
	}
</script>

<span
	class="inline-block cursor-pointer {className}"
	role="button"
	tabindex="0"
	onmouseenter={startScramble}
	onmouseleave={stopScramble}
	onfocus={startScramble}
	onblur={stopScramble}
>
	{isHovered || scrambled ? (scrambled || text) : text}
</span>
