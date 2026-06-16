import { defineChain } from "viem";

export const anvil = defineChain({
	id: 31337,
	name: "Anvil",
	nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
	rpcUrls: {
		default: { http: [import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:8545"] }
	}
});