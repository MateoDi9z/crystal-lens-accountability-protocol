// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Governance.sol
// ├── proposals
// ├── voting
// └── proof of execution

interface ITreasury {
    function isContributor(address user) external view returns (bool);

    function isContributorWithoutPendingContributions(address user) external view returns (bool);

    function getContributorCount() external view returns (uint256);

    function releaseFunds(address payable recipient, uint256 amount) external;
}

contract Governance is Ownable {
    ITreasury public immutable treasury;

    constructor(address _treasury, address _owner) Ownable(_owner) {
        require(_treasury != address(0), "Treasury cannot be zero address");

        treasury = ITreasury(_treasury);
    }

    // =====================================================
    // EVENTS
    // =====================================================

    event ProposalCreated(uint256 indexed id, address indexed proposer, string description);

    event Voted(uint256 indexed proposalId, address indexed voter, bool support);

    event ProposalApproved(uint256 indexed id);

    event ProposalRejected(uint256 indexed id);

    event ProposalExecuted(uint256 indexed id, address indexed recipient, uint256 amount);

    // =====================================================
    // PROPOSALS
    // =====================================================

    enum ProposalState {
        Pending,
        Approved,
        Rejected,
        Executed
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 amount;
        uint256 forVotes;
        uint256 againstVotes;
        ProposalState state;
    }

    uint256 private _nextProposalId;

    mapping(uint256 => Proposal) public proposals;

    mapping(uint256 => mapping(address => bool)) public voted;

    // =====================================================
    // CREATE PROPOSAL
    // =====================================================

    function createProposal(string memory _description, uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");

        uint256 id = _nextProposalId;

        _nextProposalId++;

        proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            description: _description,
            amount: _amount,
            forVotes: 0,
            againstVotes: 0,
            state: ProposalState.Pending
        });

        emit ProposalCreated(id, msg.sender, _description);
    }

    // =====================================================
    // GETTERS
    // =====================================================

    function getProposal(uint256 _id) external view returns (Proposal memory) {
        require(_id < _nextProposalId, "Proposal does not exist");

        return proposals[_id];
    }

    function proposalCount() external view returns (uint256) {
        return _nextProposalId;
    }

    function getTreasury() external view returns (address) {
        return address(treasury);
    }

    // =====================================================
    // VOTING
    // =====================================================

    function vote(uint256 _id, bool _support) external {
        require(_id < _nextProposalId, "Proposal does not exist");

        Proposal storage proposal = proposals[_id];

        require(proposal.state == ProposalState.Pending, "Proposal is not pending");

        require(treasury.isContributorWithoutPendingContributions(msg.sender), "Contributor has pending debt");

        require(!voted[_id][msg.sender], "Already voted");

        voted[_id][msg.sender] = true;

        if (_support) {
            proposal.forVotes++;
        } else {
            proposal.againstVotes++;
        }

        emit Voted(_id, msg.sender, _support);

        _updateProposalState(_id);
    }

    // =====================================================
    // INTERNAL
    // =====================================================

    function _updateProposalState(uint256 _id) internal {
        Proposal storage proposal = proposals[_id];

        uint256 totalContributors = treasury.getContributorCount();

        uint256 threshold = (totalContributors + 1) / 2;

        if (proposal.forVotes >= threshold) {
            proposal.state = ProposalState.Approved;

            emit ProposalApproved(_id);

            return;
        }

        if (proposal.againstVotes >= threshold) {
            proposal.state = ProposalState.Rejected;

            emit ProposalRejected(_id);
        }
    }

    function executeProposal(uint256 _id) external {
        require(_id < _nextProposalId, "Proposal does not exist");

        Proposal storage proposal = proposals[_id];
        require(proposal.state == ProposalState.Approved, "Proposal is not approved");

        address payable recipient = payable(owner());
        proposal.state = ProposalState.Executed;
        treasury.releaseFunds(recipient, proposal.amount);
        emit ProposalExecuted(_id, recipient, proposal.amount);
    }

    // =====================================================
    // HELPERS
    // =====================================================

    function isApproved(uint256 _id) external view returns (bool) {
        return proposals[_id].state == ProposalState.Approved;
    }

    function isPending(uint256 _id) external view returns (bool) {
        return proposals[_id].state == ProposalState.Pending;
    }

    function isExecuted(uint256 _id) external view returns (bool) {
        return proposals[_id].state == ProposalState.Executed;
    }
}
