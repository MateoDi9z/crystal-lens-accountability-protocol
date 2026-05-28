// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ITreasury {
    function isContributor(address user) external view returns (bool);

    function getContributorCount() external view returns (uint256);
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

    function createProposal(string memory _description) external onlyOwner {
        uint256 id = _nextProposalId;

        _nextProposalId++;

        proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            description: _description,
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

    // =====================================================
    // VOTING
    // =====================================================

    function vote(uint256 _id, bool _support) external {
        require(_id < _nextProposalId, "Proposal does not exist");

        Proposal storage proposal = proposals[_id];

        require(proposal.state == ProposalState.Pending, "Proposal is not pending");

        require(treasury.isContributor(msg.sender), "Not contributor");

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
