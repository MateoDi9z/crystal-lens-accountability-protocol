import type { Address } from "viem";

export const ProposalState = {
	Pending: 0,
	Approved: 1,
	Rejected: 2,
	Executed: 3
} as const;

export type ProposalStateValue = (typeof ProposalState)[keyof typeof ProposalState];

export type Proposal = {
	id: bigint;
	proposer: Address;
	description: string;
	amount: bigint;
	forVotes: bigint;
	againstVotes: bigint;
	state: ProposalStateValue;
};

export type MemberData = {
	dni: string;
	fullName: string;
};

export type Member = {
	address: Address;
	tokenId: bigint;
	data?: MemberData;
	pendingContribution: bigint;
	totalPaid: bigint;
	isContributor: boolean;
	isUpToDate: boolean;
	debtRemaining: bigint;
};

export type TreasuryOverview = {
	totalFunds: bigint;
	contributorCount: bigint;
	governance: Address;
	balance: bigint;
	owner: Address;
};

export type UserStatus = {
	address: Address;
	isMember: boolean;
	isContributor: boolean;
	canVote: boolean;
	tokenId?: bigint;
	memberData?: MemberData;
	pendingContribution: bigint;
	totalPaid: bigint;
	isUpToDate: boolean;
};

export type DashboardData = {
	treasury: TreasuryOverview;
	proposals: Proposal[];
	members: Member[];
	user?: UserStatus;
	isOwner: boolean;
};