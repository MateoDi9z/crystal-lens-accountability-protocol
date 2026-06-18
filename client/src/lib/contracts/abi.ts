import { parseAbi } from "viem";

export const membershipAbi = parseAbi([
	"struct MemberData { string dni; string fullName; }",

	// Getters
	"function treasury() view returns (address)",
	"function isMember(address user) view returns (bool)",
	"function ownerOf(uint256 tokenId) view returns (address)",
	"function getMemberTokenId(address member) view returns (uint256)",
	"function getMemberData(uint256 tokenId) view returns (MemberData)",
	"function tokenURI(uint256 tokenId) view returns (string)",

	// Actions
	"function mint(address to, (string dni, string fullName) memberData) external returns (uint256)",
	"function burn() external",

	// Events
	"event MemberAdded(address indexed member, uint256 indexed tokenId)",
	"event MemberRemoved(address indexed member, uint256 indexed tokenId)",
	"event MemberDataUpdated(uint256 indexed tokenId, string dni, string fullName)"
]);

export const treasuryAbi = parseAbi([
	// Getters
	"function getMembership() view returns (address)",
	"function governance() view returns (address)",
	"function owner() view returns (address)",
	"function totalFunds() view returns (uint256)",
	"function pendingContribution(address contributor) view returns (uint256)",
	"function getPendingContribution(address contributor) view returns (uint256)",
	"function totalPaid(address contributor) view returns (uint256)",
	"function getContributorCount() view returns (uint256)",
	"function isContributor(address contributor) view returns (bool)",
	"function isContributorWithoutPendingContributions(address contributor) view returns (bool)",

	// Actions
	"function requestContribution(address contributor, uint256 amount) external",
	"function payAllPendingContribution() external payable",

	// Events
	"event GovernanceUpdated(address indexed previousGovernance, address indexed newGovernance)",
	"event ContributionRequested(address indexed contributor, uint256 amount)",
	"event ContributionPaid(address indexed contributor, uint256 amount)",
	"event FundsDeposited(address indexed depositor, uint256 amount)",
	"event FundsReleased(address indexed recipient, uint256 amount)"
]);

export const governanceAbi = parseAbi([
	"struct Proposal { uint256 id; address proposer; string description; uint256 amount; uint256 forVotes; uint256 againstVotes; uint8 state; }",

	// Getters
	"function getTreasury() view returns (address)",
	"function owner() view returns (address)",
	"function proposals(uint256 id) view returns (uint256 id, address proposer, string description, uint256 amount, uint256 forVotes, uint256 againstVotes, uint8 state)",
	"function voted(uint256 proposalId, address voter) view returns (bool)",
	"function getProposal(uint256 id) view returns (Proposal)",
	"function proposalCount() view returns (uint256)",
	"function isApproved(uint256 id) view returns (bool)",
	"function isPending(uint256 id) view returns (bool)",
	"function isExecuted(uint256 id) view returns (bool)",

	// Actions
	"function createProposal(string description, uint256 amount) external",
	"function vote(uint256 id, bool support) external",
	"function executeProposal(uint256 id) external",

	// Events
	"event ProposalCreated(uint256 indexed id, address indexed proposer, string description)",
	"event Voted(uint256 indexed proposalId, address indexed voter, bool support)",
	"event ProposalApproved(uint256 indexed id)",
	"event ProposalRejected(uint256 indexed id)",
	"event ProposalExecuted(uint256 indexed id, address indexed recipient, uint256 amount)"
]);
