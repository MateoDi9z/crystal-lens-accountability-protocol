import { createPublicClient, http } from "viem";
import { sepolia, anvil } from "viem/chains";
import { getWalletClient } from "@wagmi/core";
import { getWagmiConfig } from "./appkit";

const chainId = Number(import.meta.env.VITE_CHAIN_ID || 11155111);
const rpcUrl = import.meta.env.VITE_RPC_URL || (chainId === 31337 ? "http://127.0.0.1:8545" : "https://rpc.ankr.com/eth_sepolia");
const targetChain = chainId === 31337 ? anvil : sepolia;

export const publicClient = createPublicClient({
	chain: targetChain,
	transport: http(rpcUrl)
});

export async function getActiveWalletClient() {
	try {
		return await getWalletClient(getWagmiConfig());
	} catch (error) {
		console.error("Error getting active wallet client:", error);
		return null;
	}
}
