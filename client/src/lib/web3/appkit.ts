import { browser } from "$app/environment";
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { anvil } from "./chains";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID ?? "";

export let appKit: ReturnType<typeof createAppKit> | undefined;
export let wagmiAdapter: WagmiAdapter | undefined;

if (browser && projectId) {
	wagmiAdapter = new WagmiAdapter({
		networks: [anvil],
		projectId,
		ssr: false
	});

	const metadata = {
		name: "Crystal Lens",
		description: "Transparent governance infrastructure for organizations",
		url: typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
		icons: ["https://avatars.githubusercontent.com/u/179229932?s=200&v=4"]
	};

	appKit = createAppKit({
		adapters: [wagmiAdapter],
		networks: [anvil],
		defaultNetwork: anvil,
		projectId,
		metadata,
		features: {
			email: true,
			socials: ["google", "github", "discord", "x"],
			emailShowWallets: true
		},
		allWallets: "SHOW"
	});
}

export const wagmiConfig = wagmiAdapter?.wagmiConfig;