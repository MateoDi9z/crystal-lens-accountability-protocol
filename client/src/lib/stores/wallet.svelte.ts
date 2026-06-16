import { browser } from "$app/environment";
import { getAccount, watchAccount } from "@wagmi/core";
import { wagmiConfig } from "$lib/web3/appkit";
import type { Address } from "viem";

let address = $state<Address | undefined>(undefined);
let isConnected = $state(false);
let chainId = $state<number | undefined>(undefined);

export function initWalletWatch() {
	if (!browser || !wagmiConfig) return;

	const sync = () => {
		const account = getAccount(wagmiConfig!);
		address = account.address;
		isConnected = account.isConnected;
		chainId = account.chainId;
	};

	sync();

	return watchAccount(wagmiConfig, {
		onChange: sync
	});
}

export function getWallet() {
	return {
		get address() {
			return address;
		},
		get isConnected() {
			return isConnected;
		},
		get chainId() {
			return chainId;
		}
	};
}