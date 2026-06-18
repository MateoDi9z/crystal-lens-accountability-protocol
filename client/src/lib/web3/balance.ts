import type { Address } from "viem";
import { getAppKit } from "./appkit";

const SEPOLIA_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);

export async function refreshSepoliaBalance(address?: Address) {
	if (!address) return;

	const kit = getAppKit();
	if (!kit) return;

	try {
		await kit.updateNativeBalance(address, SEPOLIA_CHAIN_ID, "eip155");
	} catch (error) {
		console.warn("refreshSepoliaBalance:", error);
	}
}