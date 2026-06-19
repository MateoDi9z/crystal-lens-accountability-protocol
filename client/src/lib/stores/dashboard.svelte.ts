import { getAccount, watchAccount } from "@wagmi/core";
import { getWagmiConfig } from "$lib/web3/appkit";
import { fetchSepoliaEthBalance, refreshSepoliaBalance } from "$lib/web3/balance";
import { initWeb3 } from "$lib/web3/init";
import { publicClient } from "$lib/web3/client";
import { parseWalletError } from "$lib/web3/errors";
import { getAllOrgs } from "$lib/config/orgs";
import {
	getTreasuryOverview,
	getUserStatus,
	getMembers,
	getProposals,
	resolveOrgAddresses
} from "$lib/contracts/read";
import {
	confirmTransaction,
	payPendingContribution,
	submitExecuteProposal
} from "$lib/contracts/write";
import { governanceAbi } from "$lib/contracts/abi";
import type { OrgConfig } from "$lib/config/orgs";
import type { TreasuryOverview, UserStatus, Member, Proposal } from "$lib/contracts/types";
import type { Address } from "viem";

export const SEPOLIA_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);

export interface OrgUserData {
	org: OrgConfig;
	userStatus: UserStatus;
	proposals: Proposal[];
	votes: Record<string, boolean>;
}

export type PaymentPhase = "idle" | "wallet" | "processing" | "success" | "error";

export interface PaymentFeedback {
	phase: PaymentPhase;
	message: string | null;
}

export type ReleaseFundsPhase = "idle" | "wallet" | "processing" | "success" | "error";

export interface ReleaseFundsFeedback {
	phase: ReleaseFundsPhase;
	message: string | null;
	amount?: bigint;
}

export interface OwnedOrgData {
	org: OrgConfig;
	members: Member[];
	proposals: Proposal[];
}

// Global module state for wallet connection
let walletAddress = $state<Address | undefined>(undefined);
let isConnectedState = $state<boolean>(false);
let chainIdState = $state<number | undefined>(undefined);
let sepoliaEthBalanceState = $state<bigint | null>(null);
let sepoliaBalanceLoadingState = $state(false);

// Active organization state (legacy single-org views)
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

async function fetchVoteStatus(
	org: OrgConfig,
	address: Address,
	proposals: Proposal[]
): Promise<Record<string, boolean>> {
	if (proposals.length === 0) return {};

	const { governance } = await resolveOrgAddresses(org);
	const voteStatusMap: Record<string, boolean> = {};

	await Promise.all(
		proposals.map(async (proposal) => {
			try {
				const hasVoted = await publicClient.readContract({
					address: governance,
					abi: governanceAbi,
					functionName: "voted",
					args: [proposal.id, address]
				});
				if (hasVoted) {
					voteStatusMap[proposal.id.toString()] = true;
				}
			} catch {
				// Ignore individual vote lookup failures
			}
		})
	);

	return voteStatusMap;
}

let walletWatcherStarted = false;

export async function updateSepoliaEthBalance(address?: Address) {
	if (!address) {
		sepoliaEthBalanceState = null;
		return;
	}

	sepoliaBalanceLoadingState = true;
	try {
		sepoliaEthBalanceState = await fetchSepoliaEthBalance(address);
		void refreshSepoliaBalance(address);
	} catch {
		sepoliaEthBalanceState = null;
	} finally {
		sepoliaBalanceLoadingState = false;
	}
}

export function setupWalletWatcher() {
	if (walletWatcherStarted || typeof window === "undefined") return;
	walletWatcherStarted = true;

	try {
		const config = getWagmiConfig();

		watchAccount(config, {
			onChange(account) {
				walletAddress = account.address;
				isConnectedState = account.isConnected;
				chainIdState = account.chainId;
				if (account.address) {
					void updateSepoliaEthBalance(account.address);
					refreshAllOrgsDashboard(account.address);
				} else {
					sepoliaEthBalanceState = null;
					dashboardState.allOrgsData = [];
					dashboardState.ownedOrgsData = [];
					dashboardState.userStatus = null;
					dashboardState.votes = {};
				}
			}
		});

		const initialAccount = getAccount(config);
		walletAddress = initialAccount.address;
		isConnectedState = initialAccount.isConnected;
		chainIdState = initialAccount.chainId;

		if (initialAccount.address) {
			void updateSepoliaEthBalance(initialAccount.address);
		}
	} catch (error) {
		console.error("Error setting up account watcher:", error);
	}
}

class DashboardState {
	actionLoading = $state<string | null>(null);
	loadingAllOrgs = $state(false);

	address = $derived(walletAddress);
	isConnected = $derived(isConnectedState);
	chainId = $derived(chainIdState);
	isWrongNetwork = $derived(
		this.isConnected && this.chainId !== undefined && this.chainId !== SEPOLIA_CHAIN_ID
	);
	sepoliaEthBalance = $derived(sepoliaEthBalanceState);
	sepoliaBalanceLoading = $derived(sepoliaBalanceLoadingState);

	allOrgsData = $state<OrgUserData[]>([]);
	ownedOrgsData = $state<OwnedOrgData[]>([]);
	paymentFeedback = $state<Record<string, PaymentFeedback>>({});
	releaseFundsFeedback = $state<Record<string, ReleaseFundsFeedback>>({});

	// Legacy single-org data
	treasuryOverview = $state<TreasuryOverview | null>(null);
	userStatus = $state<UserStatus | null>(null);
	members = $state<Member[]>([]);
	proposals = $state<Proposal[]>([]);
	votes = $state<Record<string, boolean>>({});

	pendingOrgs = $derived(
		this.allOrgsData.filter(
			(entry) =>
				entry.userStatus.isMember &&
				entry.userStatus.pendingContribution > 0n &&
				entry.userStatus.totalPaid < entry.userStatus.pendingContribution
		)
	);

	hasPendingDebt = $derived(this.pendingOrgs.length > 0);

	votableOrgs = $derived(
		this.allOrgsData.filter((entry) => entry.userStatus.canVote)
	);

	isOwner = $derived(
		this.userStatus && this.treasuryOverview
			? this.userStatus.address.toLowerCase() === this.treasuryOverview.owner.toLowerCase()
			: false
	);

	canVote = $derived(this.userStatus ? this.userStatus.canVote : false);
}

const dashboardState = new DashboardState();

export function getDashboardState() {
	return dashboardState;
}

export function getDebtRemaining(user: UserStatus): bigint {
	return user.pendingContribution > user.totalPaid
		? user.pendingContribution - user.totalPaid
		: 0n;
}

export async function refreshAllOrgsDashboard(userAddr?: Address) {
	const address = userAddr ?? walletAddress;
	if (!address) {
		dashboardState.allOrgsData = [];
		dashboardState.ownedOrgsData = [];
		return;
	}

	dashboardState.loadingAllOrgs = true;

	try {
		const orgs = getAllOrgs();
		const results = await Promise.all(
			orgs.map(async (org): Promise<OrgUserData | null> => {
				try {
					const userStatus = await getUserStatus(org, address);
					if (!userStatus.isMember) return null;

					const proposals = await getProposals(org).catch(() => []);
					const votes = await fetchVoteStatus(org, address, proposals);

					return { org, userStatus, proposals, votes };
				} catch (error) {
					console.error(`Error loading org ${org.slug}:`, error);
					return null;
				}
			})
		);

		dashboardState.allOrgsData = results.filter((entry): entry is OrgUserData => entry !== null);

		const ownerResults = await Promise.all(
			orgs.map(async (org): Promise<OwnedOrgData | null> => {
				try {
					const { governance } = await resolveOrgAddresses(org);
					const owner = await publicClient.readContract({
						address: governance,
						abi: governanceAbi,
						functionName: "owner"
					});
					if (owner.toLowerCase() !== address.toLowerCase()) return null;

					const [members, proposals] = await Promise.all([
						getMembers(org).catch(() => []),
						getProposals(org).catch(() => [])
					]);
					return { org, members, proposals };
				} catch {
					return null;
				}
			})
		);
		dashboardState.ownedOrgsData = ownerResults.filter((entry): entry is OwnedOrgData => entry !== null);
	} catch (error) {
		console.error("Error refreshing all orgs dashboard:", error);
	} finally {
		dashboardState.loadingAllOrgs = false;
	}
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
				dashboardState.votes = await fetchVoteStatus(
					org,
					currentAddress,
					dashboardState.proposals
				);
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

		if (currentAddress && proposalsList.length > 0) {
			dashboardState.votes = await fetchVoteStatus(org, currentAddress, proposalsList);
		}
	} catch (error) {
		console.error("Error refreshing dashboard data:", error);
	}
}

function setPaymentFeedback(slug: string, feedback: PaymentFeedback) {
	dashboardState.paymentFeedback = {
		...dashboardState.paymentFeedback,
		[slug]: feedback
	};
}

export async function runPayment(org: OrgConfig, amount: bigint) {
	const slug = org.slug;
	const address = walletAddress;
	if (!address) return;

	setPaymentFeedback(slug, {
		phase: "wallet",
		message: "Confirmá el pago en el modal de tu billetera…"
	});
	dashboardState.actionLoading = `pay-${slug}`;

	try {
		await initWeb3();
		const hash = await payPendingContribution(amount, org, address);
		setPaymentFeedback(slug, { phase: "processing", message: "Procesando tu pago…" });
		await confirmTransaction(hash);
		await refreshAllOrgsDashboard(address);
		await updateSepoliaEthBalance(address);
		setPaymentFeedback(slug, {
			phase: "success",
			message: "¡Listo! Tu contribución fue registrada. Ahora estás al día."
		});
	} catch (error) {
		console.error("Payment failed:", error);
		setPaymentFeedback(slug, {
			phase: "error",
			message: parseWalletError(error)
		});
	} finally {
		dashboardState.actionLoading = null;
	}
}

export function clearPaymentFeedback(slug: string) {
	const next = { ...dashboardState.paymentFeedback };
	delete next[slug];
	dashboardState.paymentFeedback = next;
}

function releaseFundsKey(orgSlug: string, proposalId: bigint) {
	return `${orgSlug}-${proposalId.toString()}`;
}

function setReleaseFundsFeedback(key: string, feedback: ReleaseFundsFeedback) {
	dashboardState.releaseFundsFeedback = {
		...dashboardState.releaseFundsFeedback,
		[key]: feedback
	};
}

export function clearReleaseFundsFeedback(orgSlug: string, proposalId: bigint) {
	const key = releaseFundsKey(orgSlug, proposalId);
	const next = { ...dashboardState.releaseFundsFeedback };
	delete next[key];
	dashboardState.releaseFundsFeedback = next;
}

export async function runReleaseFunds(org: OrgConfig, proposalId: bigint, amount: bigint) {
	const key = releaseFundsKey(org.slug, proposalId);
	const address = walletAddress;
	if (!address) return;

	setReleaseFundsFeedback(key, {
		phase: "wallet",
		message: "Confirmá la liberación de fondos en el modal de tu billetera…",
		amount
	});
	dashboardState.actionLoading = `release-${key}`;

	try {
		await initWeb3();
		const hash = await submitExecuteProposal(proposalId, org);
		setReleaseFundsFeedback(key, {
			phase: "processing",
			message: "Transfiriendo los fondos desde la tesorería de la organización…",
			amount
		});
		await confirmTransaction(hash);
		await refreshAllOrgsDashboard(address);
		await updateSepoliaEthBalance(address);
		setReleaseFundsFeedback(key, {
			phase: "success",
			message: "¡Listo! Los fondos aprobados ya están en tu billetera.",
			amount
		});
	} catch (error) {
		console.error("Release funds failed:", error);
		setReleaseFundsFeedback(key, {
			phase: "error",
			message: parseReleaseFundsError(error),
			amount
		});
	} finally {
		dashboardState.actionLoading = null;
	}
}

function parseReleaseFundsError(error: unknown): string {
	const message = parseWalletError(error);
	const lower = message.toLowerCase();

	if (lower.includes("proposal is not approved") || lower.includes("no está aprobada")) {
		return "Esta propuesta ya no está aprobada. Actualizá la página para ver su estado actual.";
	}
	if (lower.includes("insufficient active funds")) {
		return "La tesorería no tiene fondos suficientes para esta liberación. Verificá que los miembros hayan aportado.";
	}
	if (lower.includes("proposal does not exist")) {
		return "No encontramos esta propuesta. Actualizá la página e intentá de nuevo.";
	}

	return message.replace("pago", "liberación de fondos");
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
	} catch (error: unknown) {
		console.error(`Error running action ${key}:`, error);
		alert(parseWalletError(error));
	} finally {
		dashboardState.actionLoading = null;
	}
}