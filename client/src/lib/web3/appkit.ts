import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "your_reown_project_id_here";

export const networks: [any, ...any[]] = [sepolia];

export const wagmiAdapter = new WagmiAdapter({
	projectId,
	networks,
	ssr: true
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

const metadata = {
	name: "CLAP",
	description: "Crystal Lens Accountability Protocol",
	url: typeof window !== "undefined" ? window.location.origin : "https://clap.example.com",
	icons: ["https://avatars.githubusercontent.com/u/179229932"]
};

export const appKit = createAppKit({
	adapters: [wagmiAdapter],
	networks,
	projectId,
	metadata,
	features: {
		analytics: true
	}
});
