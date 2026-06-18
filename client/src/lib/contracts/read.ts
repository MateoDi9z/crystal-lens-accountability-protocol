import { publicClient } from "$lib/web3/client";
import { governanceAbi, treasuryAbi, membershipAbi } from "./abi";
import { ProposalState } from "./types";
import type { OrgConfig } from "$lib/config/orgs";
import type { TreasuryOverview, UserStatus, Member, Proposal } from "./types";
import { parseAbiItem, type Address } from "viem";

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
		functionName: "treasury"
	});

	// Read membership address from treasury
	const membership = await publicClient.readContract({
		address: treasury,
		abi: treasuryAbi,
		functionName: "membership"
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

export async function getMembers(org: OrgConfig): Promise<Member[]> {
	const { membership, treasury } = await resolveOrgAddresses(org);

	const [addedLogs, removedLogs] = await Promise.all([
		publicClient.getLogs({
			address: membership,
			event: parseAbiItem("event MemberAdded(address indexed member, uint256 indexed tokenId)"),
			fromBlock: 0n
		}),
		publicClient.getLogs({
			address: membership,
			event: parseAbiItem("event MemberRemoved(address indexed member, uint256 indexed tokenId)"),
			fromBlock: 0n
		})
	]);

	const activeMembersMap = new Map<Address, bigint>();

	const allLogs = [
		...addedLogs.map((log) => ({ ...log, logType: "added" as const })),
		...removedLogs.map((log) => ({ ...log, logType: "removed" as const }))
	].sort((a, b) => {
		if (a.blockNumber !== b.blockNumber) {
			return Number(a.blockNumber - b.blockNumber);
		}
		return (a.logIndex ?? 0) - (b.logIndex ?? 0);
	});

	for (const log of allLogs) {
		const member = log.args.member;
		const tokenId = log.args.tokenId;
		if (member && tokenId !== undefined) {
			if (log.logType === "added") {
				activeMembersMap.set(member, tokenId);
			} else {
				activeMembersMap.delete(member);
			}
		}
	}

	const memberPromises = Array.from(activeMembersMap.entries()).map(async ([address, tokenId]) => {
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

	const logs = await publicClient.getLogs({
		address: governance,
		event: parseAbiItem("event ProposalCreated(uint256 indexed id, address indexed proposer, string description)"),
		fromBlock: 0n
	});

	const proposalIds = logs.map((log) => log.args.id).filter((id): id is bigint => id !== undefined);

	const proposals = await Promise.all(
		proposalIds.map(async (id) => {
			const prop = await publicClient.readContract({
				address: governance,
				abi: governanceAbi,
				functionName: "getProposal",
				args: [id]
			});
			return {
				id: prop.id,
				proposer: prop.proposer,
				description: prop.description,
				amount: prop.amount,
				forVotes: prop.forVotes,
				againstVotes: prop.againstVotes,
				state: prop.state as ProposalState
			};
		})
	);

	return proposals;
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
			return "Pending";
		case ProposalState.Approved:
			return "Approved";
		case ProposalState.Rejected:
			return "Rejected";
		case ProposalState.Executed:
			return "Executed";
		default:
			return "Unknown";
	}
}
