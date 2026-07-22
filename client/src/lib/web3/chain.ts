import { sepolia as appkitSepolia, anvil as appkitAnvil } from "@reown/appkit/networks";
import { getAccount } from "@wagmi/core";
import type { GetAccountReturnType } from "@wagmi/core";
import { getAppKit, getWagmiConfig } from "./appkit";

export const SEPOLIA_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);
const activeTargetNetwork = SEPOLIA_CHAIN_ID === 31337 ? appkitAnvil : appkitSepolia;

export async function ensureSepoliaForWrite(): Promise<GetAccountReturnType> {
	const config = getWagmiConfig();
	const account = getAccount(config);

	if (!account.address || !account.isConnected) {
		throw new Error("Conectá tu billetera para continuar.");
	}

	const kit = getAppKit();
	if (!kit) {
		throw new Error("Web3 no inicializado. Recargá la página e intentá de nuevo.");
	}

	await kit.switchNetwork(activeTargetNetwork, { throwOnFailure: true });

	for (let attempt = 0; attempt < 10; attempt++) {
		const updated = getAccount(config);
		if (updated.chainId === SEPOLIA_CHAIN_ID) {
			return updated;
		}
		await new Promise((resolve) => setTimeout(resolve, 150));
	}

	return getAccount(config);
}