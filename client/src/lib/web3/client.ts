import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { getWalletClient } from "@wagmi/core";
import { wagmiConfig } from "./appkit";

const rpcUrl = import.meta.env.VITE_RPC_URL || "https://rpc.ankr.com/eth_sepolia";

export const publicClient = createPublicClient({
	chain: sepolia,
	transport: http(rpcUrl)
});

export async function getActiveWalletClient() {
	try {
		return await getWalletClient(wagmiConfig);
	} catch (error) {
		console.error("Error getting active wallet client:", error);
		return null;
	}
}
