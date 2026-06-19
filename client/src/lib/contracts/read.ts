import { publicClient } from "$lib/web3/client";
import { governanceAbi, treasuryAbi, membershipAbi } from "./abi";
import { ProposalState } from "./types";
import type { OrgConfig } from "$lib/config/orgs";
import type { TreasuryOverview, UserStatus, Member, Proposal } from "./types";
import type { Address } from "viem";

const MAX_MEMBER_TOKEN_SCAN = 256;
const MAX_EMPTY_TOKEN_RUN = 32;

export interface ResolvedOrgAddresses {
	governance: Address;
	treasury: Address;
	membership: Address;
}

export async function resolveOrgAddresses(org: OrgConfig): Promise<ResolvedOrgAddresses> {
	const governance = org.addresses.governance;

	// Read treasury address from governance
	const treasury = await publicClient.readContract({
		address: governance,
		abi: governanceAbi,
		functionName: "getTreasury"
	});

	// Read membership address from treasury
	const membership = await publicClient.readContract({
		address: treasury,
		abi: treasuryAbi,
		functionName: "getMembership"
	});

	return { governance, treasury, membership };
}

export async function getTreasuryOverview(org: OrgConfig): Promise<TreasuryOverview> {
	const { governance, treasury } = await resolveOrgAddresses(org);

	const [totalFunds, contributorCount, contractGov, owner, balance] = await Promise.all([
		publicClient.readContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "totalFunds"
		}),
		publicClient.readContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "getContributorCount"
		}),
		publicClient.readContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "governance"
		}),
		publicClient.readContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "owner"
		}),
		publicClient.getBalance({
			address: treasury
		})
	]) as [bigint, bigint, Address, Address, bigint];

	return {
		totalFunds,
		balance,
		contributorCount,
		governance: contractGov,
		owner
	};
}

export async function getUserStatus(org: OrgConfig, address: Address): Promise<UserStatus> {
	const { membership, treasury } = await resolveOrgAddresses(org);

	const [isMember, isContributor, pendingContribution, totalPaid] = await Promise.all([
		publicClient.readContract({
			address: membership,
			abi: membershipAbi,
			functionName: "isMember",
			args: [address]
		}),
		publicClient.readContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "isContributor",
			args: [address]
		}),
		publicClient.readContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "getPendingContribution",
			args: [address]
		}),
		publicClient.readContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "totalPaid",
			args: [address]
		})
	]) as [boolean, boolean, bigint, bigint];

	let memberData: { dni: string; fullName: string } | null = null;
	let tokenId: bigint | undefined = undefined;

	if (isMember) {
		try {
			tokenId = await publicClient.readContract({
				address: membership,
				abi: membershipAbi,
				functionName: "getMemberTokenId",
				args: [address]
			});

			const data = await publicClient.readContract({
				address: membership,
				abi: membershipAbi,
				functionName: "getMemberData",
				args: [tokenId]
			});

			memberData = {
				dni: data.dni,
				fullName: data.fullName
			};
		} catch (error) {
			console.error("Error fetching member details:", error);
		}
	}

	const isUpToDate = totalPaid >= pendingContribution;
	const canVote = isMember && isUpToDate;

	return {
		address,
		isMember,
		isContributor,
		isUpToDate,
		canVote,
		memberData,
		tokenId,
		pendingContribution,
		totalPaid
	};
}

async function discoverActiveMemberTokens(
	membership: Address
): Promise<Array<{ address: Address; tokenId: bigint }>> {
	const activeMembers: Array<{ address: Address; tokenId: bigint }> = [];
	let emptyRun = 0;

	for (let tokenId = 1n; tokenId <= BigInt(MAX_MEMBER_TOKEN_SCAN) && emptyRun < MAX_EMPTY_TOKEN_RUN; tokenId++) {
		try {
			const owner = await publicClient.readContract({
				address: membership,
				abi: membershipAbi,
				functionName: "ownerOf",
				args: [tokenId]
			}) as Address;

			activeMembers.push({ address: owner, tokenId });
			emptyRun = 0;
		} catch {
			emptyRun++;
		}
	}

	return activeMembers;
}

export async function getMembers(org: OrgConfig): Promise<Member[]> {
	const { membership, treasury } = await resolveOrgAddresses(org);
	const activeMembers = await discoverActiveMemberTokens(membership);

	const memberPromises = activeMembers.map(async ({ address, tokenId }) => {
		const [data, isContributor, pendingContribution, totalPaid] = await Promise.all([
			publicClient.readContract({
				address: membership,
				abi: membershipAbi,
				functionName: "getMemberData",
				args: [tokenId]
			}).catch(() => null),
			publicClient.readContract({
				address: treasury,
				abi: treasuryAbi,
				functionName: "isContributor",
				args: [address]
			}).catch(() => false),
			publicClient.readContract({
				address: treasury,
				abi: treasuryAbi,
				functionName: "getPendingContribution",
				args: [address]
			}).catch(() => 0n),
			publicClient.readContract({
				address: treasury,
				abi: treasuryAbi,
				functionName: "totalPaid",
				args: [address]
			}).catch(() => 0n)
		]) as [any, boolean, bigint, bigint];

		const isUpToDate = totalPaid >= pendingContribution;
		const debtRemaining = pendingContribution > totalPaid ? pendingContribution - totalPaid : 0n;

		return {
			address,
			tokenId,
			data: data ? { dni: data.dni, fullName: data.fullName } : null,
			isContributor,
			isUpToDate,
			pendingContribution,
			totalPaid,
			debtRemaining
		};
	});

	return Promise.all(memberPromises);
}

export async function getProposals(org: OrgConfig): Promise<Proposal[]> {
	const { governance } = await resolveOrgAddresses(org);

	const count = await publicClient.readContract({
		address: governance,
		abi: governanceAbi,
		functionName: "proposalCount"
	});

	if (count === 0n) return [];

	const rawProposals = await Promise.all(
		Array.from({ length: Number(count) }, (_, index) =>
			publicClient.readContract({
				address: governance,
				abi: governanceAbi,
				functionName: "getProposal",
				args: [BigInt(index)]
			})
		)
	);

	return rawProposals.map((prop) => ({
		id: prop.id,
		proposer: prop.proposer,
		description: prop.description,
		amount: prop.amount,
		forVotes: prop.forVotes,
		againstVotes: prop.againstVotes,
		state: prop.state as ProposalState
	}));
}

export async function isOwner(org: OrgConfig, address: Address): Promise<boolean> {
	const { governance } = await resolveOrgAddresses(org);
	const owner = await publicClient.readContract({
		address: governance,
		abi: governanceAbi,
		functionName: "owner"
	});
	return owner.toLowerCase() === address.toLowerCase();
}

export function proposalStateName(state: ProposalState): string {
	switch (state) {
		case ProposalState.Pending:
			return "En votación";
		case ProposalState.Approved:
			return "Aprobada";
		case ProposalState.Rejected:
			return "Rechazada";
		case ProposalState.Executed:
			return "Fondos liberados";
		default:
			return "Desconocido";
	}
}
