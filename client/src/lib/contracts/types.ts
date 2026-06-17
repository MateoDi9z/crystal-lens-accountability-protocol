import type { Address } from "viem";

export interface Org {
	slug: string;
	name: string;
	description: string;
	addresses: {
		governance: Address;
		treasury?: Address;
		membership?: Address;
	};
}

export interface TreasuryOverview {
	totalFunds: bigint;
	balance: bigint;
	contributorCount: bigint;
	governance: Address;
	owner: Address;
}

export interface Member {
	address: Address;
	tokenId: bigint;
	data: {
		dni: string;
		fullName: string;
	} | null;
	isContributor: boolean;
	isUpToDate: boolean;
	pendingContribution: bigint;
	totalPaid: bigint;
	debtRemaining: bigint;
}

export interface UserStatus {
	address: Address;
	isMember: boolean;
	isContributor: boolean;
	isUpToDate: boolean;
	canVote: boolean;
	memberData: {
		dni: string;
		fullName: string;
	} | null;
	tokenId?: bigint;
	pendingContribution: bigint;
	totalPaid: bigint;
}

export enum ProposalState {
	Pending = 0,
	Approved = 1,
	Rejected = 2,
	Executed = 3
}

export interface Proposal {
	id: bigint;
	proposer: Address;
	description: string;
	amount: bigint;
	forVotes: bigint;
	againstVotes: bigint;
	state: ProposalState;
}
