<script lang="ts">
	import { Check, Copy } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button/index.js";

	let {
		address,
		className = "",
		showFull = false
	}: {
		address: string;
		className?: string;
		showFull?: boolean;
	} = $props();

	let copied = $state(false);

	const formatted = $derived(
		showFull ? address : `${address.slice(0, 6)}…${address.slice(-4)}`
	);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(address);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error("Failed to copy address:", err);
		}
	}
</script>

<div class="inline-flex items-center gap-1.5 font-mono text-xs {className}">
	<span class="bg-muted/50 rounded-md px-1.5 py-0.5 select-all">{formatted}</span>
	<Button
		variant="ghost"
		size="icon"
		class="size-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
		title="Copiar dirección completa"
		onclick={handleCopy}
	>
		{#if copied}
			<Check class="size-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
		{:else}
			<Copy class="size-3.5" />
		{/if}
		<span class="sr-only">Copiar dirección</span>
	</Button>
	{#if copied}
		<span class="text-[10px] text-emerald-500 font-sans font-medium animate-in fade-in duration-200">
			¡Copiado!
		</span>
	{/if}
</div>
