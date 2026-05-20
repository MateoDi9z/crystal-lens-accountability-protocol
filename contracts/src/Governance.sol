// SPDX-License-Identifier: GNU Affero General Public License v3.0
pragma solidity 0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Governance is Ownable {
    enum ProposalStatus {
        Active,
        Approved,
        Rejected,
        Executed
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 amount;
        address payable recipient;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endBlock;
        ProposalStatus status;
    }

    uint256 public proposalCount;

    mapping(address => bool) public organizations;
    mapping(address => bool) public contributors;

    mapping(uint256 => Proposal) public proposals;

    // proposalId => voter => voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Events
    event OrganizationAdded(address indexed organization);
    event ContributorAdded(address indexed contributor);

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer);

    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support
    );

    event ProposalFinalized(uint256 indexed proposalId, ProposalStatus status);

    modifier onlyOrganization() {
        require(organizations[msg.sender], "Not organization");
        _;
    }

    modifier onlyContributor() {
        require(contributors[msg.sender], "Not contributor");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        // The deployer of the contract is the initial owner
    }

    function addOrganization(address organization) external onlyOwner {
        organizations[organization] = true;

        emit OrganizationAdded(organization);
    }

    function addContributor(address contributor) external onlyOwner {
        contributors[contributor] = true;

        emit ContributorAdded(contributor);
    }

    function createProposal(
        string memory title,
        string memory description,
        uint256 amount,
        address payable recipient,
        uint256 durationInBlocks
    ) external onlyOrganization {
        proposalCount++;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            title: title,
            description: description,
            amount: amount,
            recipient: recipient,
            votesFor: 0,
            votesAgainst: 0,
            endBlock: block.number + durationInBlocks,
            status: ProposalStatus.Active
        });

        emit ProposalCreated(proposalCount, msg.sender);
    }

    function vote(uint256 proposalId, bool support) external onlyContributor {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");

        require(block.number <= proposal.endBlock, "Voting ended");

        require(
            proposal.status == ProposalStatus.Active,
            "Proposal not active"
        );

        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit Voted(proposalId, msg.sender, support);
    }

    function finalizeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");

        require(block.number > proposal.endBlock, "Voting not ended");

        require(proposal.status == ProposalStatus.Active, "Already finalized");

        if (proposal.votesFor > proposal.votesAgainst) {
            // Ask Treasury for money.
            proposal.status = ProposalStatus.Approved;
        } else {
            proposal.status = ProposalStatus.Rejected;
        }

        emit ProposalFinalized(proposalId, proposal.status);
    }

    // Getters
    function getProposal(
        uint256 proposalId
    ) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
}
