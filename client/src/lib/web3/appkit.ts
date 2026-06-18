import { browser } from "$app/environment";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit";
import type { AppKit } from "@reown/appkit";
import type { Config } from "@wagmi/core";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "your_reown_project_id_here";

export const networks: [typeof sepolia, ...typeof sepolia[]] = [sepolia];

let wagmiAdapter: WagmiAdapter | undefined;
let wagmiConfig: Config | undefined;
let appKit: AppKit | undefined;

function createWeb3() {
	if (!browser || appKit) return;

	wagmiAdapter = new WagmiAdapter({
		projectId,
		networks,
		ssr: false,
		multiInjectedProviderDiscovery: true
	});

	wagmiConfig = wagmiAdapter.wagmiConfig;

	const metadata = {
		name: "Crystal Lens",
		description: "Crystal Lens Accountability Protocol",
		url: window.location.origin,
		icons: ["https://avatars.githubusercontent.com/u/179229932"]
	};

	appKit = createAppKit({
		adapters: [wagmiAdapter],
		networks,
		projectId,
		metadata,
		defaultNetwork: sepolia,
		showWallets: true,
		enableEIP6963: true,
		enableInjected: true,
		allWallets: "SHOW",
		features: {
			analytics: false,
			email: true,
			emailShowWallets: true,
			collapseWallets: false,
			socials: ["google", "x", "discord", "github", "apple"],
			connectMethodsOrder: ["wallet", "email", "social"],
			connectorTypeOrder: [
				"injected",
				"recent",
				"walletConnect",
				"featured",
				"recommended",
				"custom",
				"external"
			]
		},
		defaultAccountTypes: {
			eip155: "eoa"
		}
	});
}

export function getWagmiAdapter(): WagmiAdapter {
	createWeb3();
	if (!wagmiAdapter) {
		throw new Error("Web3 is only available in the browser.");
	}
	return wagmiAdapter;
}

export function getWagmiConfig(): Config {
	createWeb3();
	if (!wagmiConfig) {
		throw new Error("Web3 is only available in the browser.");
	}
	return wagmiConfig;
}

export function getAppKit(): AppKit | undefined {
	createWeb3();
	return appKit;
}

export { appKit, wagmiConfig, wagmiAdapter };