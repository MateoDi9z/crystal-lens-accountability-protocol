import deployed from "./deployed.json";
import type { Address } from "viem";

export const contractAddresses = {
	membership: (import.meta.env.VITE_MEMBERSHIP_ADDRESS ?? deployed.membership) as Address,
	treasury: (import.meta.env.VITE_TREASURY_ADDRESS ?? deployed.treasury) as Address,
	governance: (import.meta.env.VITE_GOVERNANCE_ADDRESS ?? deployed.governance) as Address,
	chainId: Number(import.meta.env.VITE_CHAIN_ID ?? deployed.chainId)
};