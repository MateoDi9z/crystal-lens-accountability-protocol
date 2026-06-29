<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Check, Copy, ExternalLink } from "@lucide/svelte";
	import { sepoliaAddressUrl } from "$lib/web3/explorer";

	let { address }: { address: string } = $props();

	let copied = $state(false);

	async function copyAddress() {
		try {
			await navigator.clipboard.writeText(address);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Ignore clipboard failures
		}
	}
</script>

<div class="inline-flex shrink-0 items-center gap-0.5">
	<Button
		variant="ghost"
		size="icon-xs"
		class="text-muted-foreground hover:text-foreground"
		title="Copiar dirección"
		aria-label="Copiar dirección"
		onclick={copyAddress}
	>
		{#if copied}
			<Check class="size-3" />
		{:else}
			<Copy class="size-3" />
		{/if}
	</Button>
	<Button
		variant="ghost"
		size="icon-xs"
		class="text-muted-foreground hover:text-foreground"
		title="Ver en SepoliaScan"
		aria-label="Ver en SepoliaScan"
		href={sepoliaAddressUrl(address)}
		target="_blank"
		rel="noopener noreferrer"
	>
		<ExternalLink class="size-3" />
	</Button>
</div>