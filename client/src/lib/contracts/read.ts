import { type Address, parseAbiItem } from "viem";
import { contractAddresses } from "./addresses";
import { membershipAbi } from "./abis/membership";
import { treasuryAbi } from "./abis/treasury";
import { governanceAbi } from "./abis/governance";
import { publicClient } from "$lib/web3/client";
import {
	ProposalState,
	type DashboardData,
	type Member,
	type Proposal,
	type ProposalStateValue,
	type UserStatus
} from "./types";

const { membership, treasury, governance } = contractAddresses;

function proposalStateLabel(state: number): ProposalStateValue {
	return state as ProposalStateValue;
}

export async function fetchTreasuryOverview() {
	const [totalFunds, contributorCount, governanceAddr, balance, owner] = await Promise.all([
		publicClient.readContract({ address: treasury, abi: treasuryAbi, functionName: "totalFunds" }),
		publicClient.readContract({ address: treasury, abi: treasuryAbi, functionName: "getContributorCount" }),
		publicClient.readContract({ address: treasury, abi: treasuryAbi, functionName: "governance" }),
		publicClient.getBalance({ address: treasury }),
		publicClient.readContract({ address: treasury, abi: treasuryAbi, functionName: "owner" })
	]);

	return { totalFunds, contributorCount, governance: governanceAddr, balance, owner };
}

export async function fetchMembers(): Promise<Member[]> {
	const addedLogs = await publicClient.getLogs({
		address: membership,
		event: parseAbiItem("event MemberAdded(address indexed member, uint256 indexed tokenId)"),
		fromBlock: 0n
	});

	const removedLogs = await publicClient.getLogs({
		address: membership,
		event: parseAbiItem("event MemberRemoved(address indexed member, uint256 indexed tokenId)"),
		fromBlock: 0n
	});

	const removed = new Set(removedLogs.map((log) => log.args.member?.toLowerCase()));

	const members: Member[] = [];

	for (const log of addedLogs) {
		const address = log.args.member as Address;
		if (!address || removed.has(address.toLowerCase())) continue;

		const tokenId = log.args.tokenId as bigint;
		let data: Member["data"];

		try {
			const memberData = await publicClient.readContract({
				address: membership,
				abi: membershipAbi,
				functionName: "getMemberData",
				args: [tokenId]
			});
			data = { dni: memberData.dni, fullName: memberData.fullName };
		} catch {
			// member may have been burned
			continue;
		}

		const [pendingContribution, totalPaid, isContributor] = await Promise.all([
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
			}),
			publicClient.readContract({
				address: treasury,
				abi: treasuryAbi,
				functionName: "isContributor",
				args: [address]
			})
		]);

		const isUpToDate = isContributor && totalPaid >= pendingContribution;
		const debtRemaining = pendingContribution > totalPaid ? pendingContribution - totalPaid : 0n;

		members.push({
			address,
			tokenId,
			data,
			pendingContribution,
			totalPaid,
			isContributor,
			isUpToDate,
			debtRemaining
		});
	}

	return members.sort((a, b) => Number(a.tokenId - b.tokenId));
}

export async function fetchProposals(): Promise<Proposal[]> {
	const count = await publicClient.readContract({
		address: governance,
		abi: governanceAbi,
		functionName: "proposalCount"
	});

	const proposals: Proposal[] = [];

	for (let id = 0n; id < count; id++) {
		const proposal = await publicClient.readContract({
			address: governance,
			abi: governanceAbi,
			functionName: "getProposal",
			args: [id]
		});

		proposals.push({
			id: proposal.id,
			proposer: proposal.proposer,
			description: proposal.description,
			amount: proposal.amount,
			forVotes: proposal.forVotes,
			againstVotes: proposal.againstVotes,
			state: proposalStateLabel(Number(proposal.state))
		});
	}

	return proposals;
}

export async function fetchUserStatus(address: Address): Promise<UserStatus> {
	const [isMember, pendingContribution, totalPaid, isContributor] = await Promise.all([
		publicClient.readContract({ address: membership, abi: membershipAbi, functionName: "isMember", args: [address] }),
		publicClient.readContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "getPendingContribution",
			args: [address]
		}),
		publicClient.readContract({ address: treasury, abi: treasuryAbi, functionName: "totalPaid", args: [address] }),
		publicClient.readContract({ address: treasury, abi: treasuryAbi, functionName: "isContributor", args: [address] })
	]);

	let tokenId: bigint | undefined;
	let memberData: UserStatus["memberData"];

	if (isMember) {
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
		memberData = { dni: data.dni, fullName: data.fullName };
	}

	const isUpToDate = isContributor && totalPaid >= pendingContribution;

	return {
		address,
		isMember,
		isContributor,
		canVote: isContributor,
		tokenId,
		memberData,
		pendingContribution,
		totalPaid,
		isUpToDate
	};
}

export async function hasVoted(proposalId: bigint, voter: Address): Promise<boolean> {
	return publicClient.readContract({
		address: governance,
		abi: governanceAbi,
		functionName: "voted",
		args: [proposalId, voter]
	});
}

export async function fetchDashboard(userAddress?: Address): Promise<DashboardData> {
	const [treasuryData, proposals, members] = await Promise.all([
		fetchTreasuryOverview(),
		fetchProposals(),
		fetchMembers()
	]);

	const user = userAddress ? await fetchUserStatus(userAddress) : undefined;
	const isOwner = Boolean(
		userAddress && userAddress.toLowerCase() === treasuryData.owner.toLowerCase()
	);

	return { treasury: treasuryData, proposals, members, user, isOwner };
}

export function proposalStateName(state: ProposalStateValue): string {
	switch (state) {
		case ProposalState.Approved:
			return "Approved";
		case ProposalState.Rejected:
			return "Rejected";
		case ProposalState.Executed:
			return "Executed";
		default:
			return "Pending";
	}
}