import { createPublicClient, http } from "viem";
import { anvil } from "./chains";

export const publicClient = createPublicClient({
	chain: anvil,
	transport: http()
});