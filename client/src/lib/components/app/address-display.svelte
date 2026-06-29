<script lang="ts">
	import AddressActions from "$lib/components/app/address-actions.svelte";
	import { cn } from "$lib/utils";

	let {
		address,
		truncate = false,
		breakAll = false,
		class: className = ""
	}: {
		address: string;
		truncate?: boolean;
		breakAll?: boolean;
		class?: string;
	} = $props();

	function formatAddress(value: string) {
		if (!truncate) return value;
		return `${value.slice(0, 6)}…${value.slice(-4)}`;
	}
</script>

<span class={cn("inline-flex items-center gap-1.5", breakAll && "flex-wrap", className)}>
	<span class={cn("font-mono", breakAll && "break-all")}>{formatAddress(address)}</span>
	<AddressActions {address} />
</span>