import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit";
import { injected } from "@wagmi/connectors";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "your_reown_project_id_here";

export const networks: [typeof sepolia, ...typeof sepolia[]] = [sepolia];

export const wagmiAdapter = new WagmiAdapter({
	projectId,
	networks,
	ssr: true,
	connectors: [
		injected({ target: "rabby", shimDisconnect: true }),
		injected({ target: "metaMask", shimDisconnect: true })
	]
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

const metadata = {
	name: "Crystal Lens",
	description: "Crystal Lens Accountability Protocol",
	url: typeof window !== "undefined" ? window.location.origin : "https://clap.example.com",
	icons: ["https://avatars.githubusercontent.com/u/179229932"]
};

export const appKit = createAppKit({
	adapters: [wagmiAdapter],
	networks,
	projectId,
	metadata,
	defaultNetwork: sepolia,
	showWallets: true,
	enableEIP6963: true,
	enableInjected: true,
	allWallets: "SHOW",
	featuredWalletIds: [
		"c286eebc742a53775f673f716e18ab6c" // Rabby
	],
	features: {
		analytics: false,
		email: false,
		socials: false
	}
});