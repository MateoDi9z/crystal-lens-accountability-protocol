import type { Address } from "viem";
import { fetchDashboard, hasVoted } from "$lib/contracts/read";
import type { DashboardData } from "$lib/contracts/types";

let data = $state<DashboardData | null>(null);
let votes = $state<Record<string, boolean>>({});
let loading = $state(false);
let error = $state<string | null>(null);
let actionLoading = $state<string | null>(null);
let actionMessage = $state<string | null>(null);

export function getDashboardState() {
	return {
		get data() {
			return data;
		},
		get votes() {
			return votes;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get actionLoading() {
			return actionLoading;
		},
		get actionMessage() {
			return actionMessage;
		}
	};
}

export async function refreshDashboard(userAddress?: Address) {
	loading = true;
	error = null;

	try {
		data = await fetchDashboard(userAddress);

		if (userAddress && data.proposals.length > 0) {
			const voteEntries = await Promise.all(
				data.proposals.map(async (proposal) => {
					const voted = await hasVoted(proposal.id, userAddress);
					return [`${proposal.id}`, voted] as const;
				})
			);
			votes = Object.fromEntries(voteEntries);
		} else {
			votes = {};
		}
	} catch (e) {
		error = e instanceof Error ? e.message : "Failed to load on-chain data";
	} finally {
		loading = false;
	}
}

export async function runAction(key: string, fn: () => Promise<unknown>, onSuccess?: () => Promise<void>) {
	actionLoading = key;
	actionMessage = null;

	try {
		await fn();
		actionMessage = "Transaction confirmed";
		if (onSuccess) await onSuccess();
	} catch (e) {
		actionMessage = e instanceof Error ? e.message : "Transaction failed";
		throw e;
	} finally {
		actionLoading = null;
	}
}

export function clearActionMessage() {
	actionMessage = null;
}