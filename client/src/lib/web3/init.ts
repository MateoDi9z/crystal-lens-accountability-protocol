import { browser } from "$app/environment";
import type { Config } from "@wagmi/core";
import { getAppKit, getWagmiAdapter, getWagmiConfig, syncAppKitTheme } from "./appkit";
import { setupWalletWatcher } from "$lib/stores/dashboard.svelte";

let initPromise: Promise<void> | null = null;

function countEip6963Connectors(config: Config) {
	return config.connectors.filter(
		(connector) => connector.type === "injected" && connector.id !== "injected"
	).length;
}

async function waitForInjectedConnectors(config: Config, timeoutMs = 2500) {
	const startedAt = Date.now();

	while (Date.now() - startedAt < timeoutMs) {
		if (countEip6963Connectors(config) > 0) return;
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
}

/**
 * Hidrata wagmi y sincroniza conectores EIP-6963 (wallets instaladas) con AppKit.
 * Debe correr en el browser antes de abrir el modal de conexión.
 */
export function initWeb3(): Promise<void> {
	if (!browser) return Promise.resolve();

	if (!initPromise) {
		initPromise = (async () => {
			const config = getWagmiConfig();
			const adapter = getWagmiAdapter();
			const kit = getAppKit();

			try {
				const store = config._internal.store as {
					persist?: { rehydrate: () => Promise<void> };
				};
				await store.persist?.rehydrate();
			} catch {
				// rehydrate opcional según versión de wagmi
			}

			await waitForInjectedConnectors(config);

			try {
				await adapter.syncConnectors();
			} catch {
				// syncConnectors puede fallar sin bloquear la app
			}

			setupWalletWatcher();

			syncAppKitTheme();

			try {
				await kit?.ready?.();
			} catch {
				// ready() no existe en todas las versiones
			}
		})();
	}

	return initPromise;
}