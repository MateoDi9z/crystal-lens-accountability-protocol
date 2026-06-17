import { getAccount, watchAccount } from "@wagmi/core";
import { wagmiConfig } from "$lib/web3/appkit";
import { publicClient } from "$lib/web3/client";
import { getAllOrgs } from "$lib/config/orgs";
import { getTreasuryOverview, getUserStatus, getMembers, getProposals, resolveOrgAddresses } from "$lib/contracts/read";
import { governanceAbi } from "$lib/contracts/abi";
import type { OrgConfig } from "$lib/config/orgs";
import type { TreasuryOverview, UserStatus, Member, Proposal } from "$lib/contracts/types";
import type { Address } from "viem";

// Global module state for wallet connection
let walletAddress = $state<Address | undefined>(undefined);
let isConnectedState = $state<boolean>(false);
let chainIdState = $state<number | undefined>(undefined);

// Active organization state
let activeOrg = $state<OrgConfig>(getAllOrgs()[0]);

export function getActiveOrg(): OrgConfig {
	return activeOrg;
}

export function setActiveOrg(org: OrgConfig) {
	activeOrg = org;
	if (walletAddress) {
		refreshDashboard(walletAddress);
	} else {
		refreshDashboard();
	}
}

// Watch account connection and update state
if (typeof window !== "undefined") {
	try {
		watchAccount(wagmiConfig, {
			onChange(account) {
				walletAddress = account.address;
				isConnectedState = account.isConnected;
				chainIdState = account.chainId;
				refreshDashboard(account.address);
			}
		});

		const initialAccount = getAccount(wagmiConfig);
		walletAddress = initialAccount.address;
		isConnectedState = initialAccount.isConnected;
		chainIdState = initialAccount.chainId;
	} catch (error) {
		console.error("Error setting up account watcher:", error);
	}
}

class DashboardState {
	// Action Loading state key (e.g. "pay", "vote-1-true")
	actionLoading = $state<string | null>(null);

	// Wallet connection state
	address = $derived(walletAddress);
	isConnected = $derived(isConnectedState);
	chainId = $derived(chainIdState);

	// Loaded data
	treasuryOverview = $state<TreasuryOverview | null>(null);
	userStatus = $state<UserStatus | null>(null);
	members = $state<Member[]>([]);
	proposals = $state<Proposal[]>([]);
	votes = $state<Record<string, boolean>>({});

	// Derived status helpers
	isOwner = $derived(
		this.userStatus && this.treasuryOverview
			? this.userStatus.address.toLowerCase() === this.treasuryOverview.owner.toLowerCase()
			: false
	);

	canVote = $derived(
		this.userStatus ? this.userStatus.canVote : false
	);
}

const dashboardState = new DashboardState();

export function getDashboardState() {
	return dashboardState;
}

export async function refreshDashboard(userAddr?: Address) {
	const org = getActiveOrg();
	if (!org) return;

	try {
		const overview = await getTreasuryOverview(org);
		dashboardState.treasuryOverview = overview;

		const currentAddress = userAddr || walletAddress;
		if (currentAddress) {
			const status = await getUserStatus(org, currentAddress);
			dashboardState.userStatus = status;

			if (dashboardState.proposals.length > 0) {
				const { governance } = await resolveOrgAddresses(org);
				const voteStatusMap: Record<string, boolean> = {};

				await Promise.all(
					dashboardState.proposals.map(async (p) => {
						try {
							const hasVoted = await publicClient.readContract({
								address: governance,
								abi: governanceAbi,
								functionName: "voted",
								args: [p.id, currentAddress]
							});
							if (hasVoted) {
								voteStatusMap[p.id.toString()] = true;
							}
						} catch {
							// Ignore log errors for individual proposals
						}
					})
				);
				dashboardState.votes = voteStatusMap;
			}
		} else {
			dashboardState.userStatus = null;
			dashboardState.votes = {};
		}

		const [membersList, proposalsList] = await Promise.all([
			getMembers(org).catch(() => []),
			getProposals(org).catch(() => [])
		]);

		dashboardState.members = membersList;
		dashboardState.proposals = proposalsList;

		// Refetch votes map if proposals were loaded in parallel
		if (currentAddress && Object.keys(dashboardState.votes).length === 0 && proposalsList.length > 0) {
			const { governance } = await resolveOrgAddresses(org);
			const voteStatusMap: Record<string, boolean> = {};

			await Promise.all(
				proposalsList.map(async (p) => {
					try {
						const hasVoted = await publicClient.readContract({
							address: governance,
							abi: governanceAbi,
							functionName: "voted",
							args: [p.id, currentAddress]
						});
						if (hasVoted) {
							voteStatusMap[p.id.toString()] = true;
						}
					} catch {
						// Ignore
					}
				})
			);
			dashboardState.votes = voteStatusMap;
		}
	} catch (error) {
		console.error("Error refreshing dashboard data:", error);
	}
}

export async function runAction(
	key: string,
	actionFn: () => Promise<any>,
	successCallback?: () => any
) {
	dashboardState.actionLoading = key;
	try {
		await actionFn();
		if (successCallback) {
			await successCallback();
		}
	} catch (error: any) {
		console.error(`Error running action ${key}:`, error);
		alert(error?.message || "Transaction failed");
	} finally {
		dashboardState.actionLoading = null;
	}
}
