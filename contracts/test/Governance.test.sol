// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {Governance} from "../src/Governance.sol";

contract MockTreasury {
    mapping(address => bool) public contributors;
    mapping(address => bool) public hasPendingDebt;

    uint256 public contributorCount;
    address public lastRecipient;
    uint256 public lastAmount;

    function setContributor(address user, bool value) external {
        bool previous = contributors[user];

        contributors[user] = value;

        if (!previous && value) {
            contributorCount++;
        }

        if (previous && !value) {
            contributorCount--;
        }
    }

    function setPendingDebt(address user, bool value) external {
        hasPendingDebt[user] = value;
    }

    function isContributor(address user) external view returns (bool) {
        return contributors[user];
    }

    function isContributorWithoutPendingContributions(address user) external view returns (bool) {
        return contributors[user] && !hasPendingDebt[user];
    }

    function getContributorCount() external view returns (uint256) {
        return contributorCount;
    }

    function releaseFunds(address payable recipient, uint256 amount) external {
        lastRecipient = recipient;
        lastAmount = amount;
    }
}

contract GovernanceTest is Test {
    Governance governance;
    MockTreasury treasury;

    address owner = address(this);

    address alice = address(1);
    address bob = address(2);
    address charlie = address(3);
    address david = address(4);

    uint256 proposalId = 0;

    function setUp() public {
        treasury = new MockTreasury();

        governance = new Governance(address(treasury), owner);

        treasury.setContributor(alice, true);
        treasury.setContributor(bob, true);
        treasury.setContributor(charlie, true);
        treasury.setContributor(david, true);
    }

    // =====================================================
    // OWNER
    // =====================================================

    function testOwnerIsCorrect() public view {
        assertEq(governance.owner(), owner);
    }

    function testTreasuryIsCorrect() public view {
        assertEq(governance.getTreasury(), address(treasury));
    }

    // =====================================================
    // CREATE PROPOSAL
    // =====================================================

    function testOwnerCanCreateProposal() public {
        governance.createProposal("Build new hospital", 10 ether);

        (
            uint256 id,
            address proposer,
            string memory description,
            uint256 amount,
            uint256 votesFor,
            uint256 votesAgainst,
            Governance.ProposalState state
        ) = governance.proposals(proposalId);

        assertEq(id, 0);

        assertEq(proposer, owner);

        assertEq(description, "Build new hospital");

        assertEq(amount, 10 ether);

        assertEq(votesFor, 0);

        assertEq(votesAgainst, 0);

        assertEq(uint8(state), uint8(Governance.ProposalState.Pending));
    }

    function testNonOwnerCannotCreateProposal() public {
        vm.prank(alice);

        vm.expectRevert();

        governance.createProposal("Malicious proposal", 1 ether);
    }

    // =====================================================
    // VOTING
    // =====================================================

    function testContributorCanVoteFor() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);

        governance.vote(proposalId, true);

        (,,,, uint256 votesFor, uint256 votesAgainst, Governance.ProposalState state) = governance.proposals(proposalId);

        assertEq(votesFor, 1);

        assertEq(votesAgainst, 0);

        assertEq(uint8(state), uint8(Governance.ProposalState.Pending));
    }

    function testContributorCanVoteAgainst() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);

        governance.vote(proposalId, false);

        (,,,, uint256 votesFor, uint256 votesAgainst, Governance.ProposalState state) = governance.proposals(proposalId);

        assertEq(votesFor, 0);

        assertEq(votesAgainst, 1);

        assertEq(uint8(state), uint8(Governance.ProposalState.Pending));
    }

    function testNonContributorCannotVote() public {
        address randomUser = address(999);

        governance.createProposal("Test", 1 ether);

        vm.prank(randomUser);

        vm.expectRevert("Contributor has pending debt");

        governance.vote(proposalId, true);
    }

    function testContributorWithPendingDebtCannotVote() public {
        governance.createProposal("Test", 1 ether);
        treasury.setPendingDebt(alice, true);

        vm.prank(alice);

        vm.expectRevert("Contributor has pending debt");

        governance.vote(proposalId, true);
    }

    function testCannotVoteTwice() public {
        governance.createProposal("Test", 1 ether);

        vm.startPrank(alice);

        governance.vote(proposalId, true);

        vm.expectRevert("Already voted");

        governance.vote(proposalId, true);

        vm.stopPrank();
    }

    function testVoteGetsRegistered() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);

        governance.vote(proposalId, true);

        bool voted = governance.voted(proposalId, alice);

        assertTrue(voted);
    }

    function testCannotVoteNonExistentProposal() public {
        vm.prank(alice);

        vm.expectRevert("Proposal does not exist");

        governance.vote(999, true);
    }

    // =====================================================
    // APPROVAL RULE
    // =====================================================

    function testProposalNotApprovedBefore50Percent() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);
        governance.vote(proposalId, true);

        bool approved = governance.isApproved(proposalId);

        assertFalse(approved);
    }

    function testProposalApprovedAt50PercentForVotes() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);
        governance.vote(proposalId, true);

        vm.prank(bob);
        governance.vote(proposalId, true);

        bool approved = governance.isApproved(proposalId);

        assertTrue(approved);

        (,,,,,, Governance.ProposalState state) = governance.proposals(proposalId);

        assertEq(uint8(state), uint8(Governance.ProposalState.Approved));
    }

    function testProposalRejectedAt50PercentAgainstVotes() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);
        governance.vote(proposalId, false);

        vm.prank(bob);
        governance.vote(proposalId, false);

        (,,,,,, Governance.ProposalState state) = governance.proposals(proposalId);

        assertEq(uint8(state), uint8(Governance.ProposalState.Rejected));
    }

    function testProposalNotApprovedWithSplitVotes() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);
        governance.vote(proposalId, true);

        vm.prank(bob);
        governance.vote(proposalId, false);

        bool approved = governance.isApproved(proposalId);

        assertFalse(approved);

        (,,,,,, Governance.ProposalState state) = governance.proposals(proposalId);

        assertEq(uint8(state), uint8(Governance.ProposalState.Pending));
    }

    // =====================================================
    // STATE VALIDATION
    // =====================================================

    function testCannotVoteApprovedProposal() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);
        governance.vote(proposalId, true);

        vm.prank(bob);
        governance.vote(proposalId, true);

        vm.prank(charlie);

        vm.expectRevert("Proposal is not pending");

        governance.vote(proposalId, true);
    }

    function testCannotVoteRejectedProposal() public {
        governance.createProposal("Test", 1 ether);

        vm.prank(alice);
        governance.vote(proposalId, false);

        vm.prank(bob);
        governance.vote(proposalId, false);

        vm.prank(charlie);

        vm.expectRevert("Proposal is not pending");

        governance.vote(proposalId, false);
    }

    // =====================================================
    // MULTIPLE PROPOSALS
    // =====================================================

    function testCanCreateMultipleProposals() public {
        governance.createProposal("Proposal 1", 1 ether);

        governance.createProposal("Proposal 2", 2 ether);

        (uint256 id1,, string memory description1, uint256 amount1,,, Governance.ProposalState state1) =
            governance.proposals(0);

        (uint256 id2,, string memory description2, uint256 amount2,,, Governance.ProposalState state2) =
            governance.proposals(1);

        assertEq(id1, 0);

        assertEq(description1, "Proposal 1");

        assertEq(amount1, 1 ether);

        assertEq(uint8(state1), uint8(Governance.ProposalState.Pending));

        assertEq(id2, 1);

        assertEq(description2, "Proposal 2");

        assertEq(amount2, 2 ether);

        assertEq(uint8(state2), uint8(Governance.ProposalState.Pending));
    }

    function testApprovedProposalCanBeExecuted() public {
        governance.createProposal("Build clinic", 3 ether);

        vm.prank(alice);
        governance.vote(proposalId, true);

        vm.prank(bob);
        governance.vote(proposalId, true);

        governance.executeProposal(proposalId);

        assertEq(treasury.lastRecipient(), owner);
        assertEq(treasury.lastAmount(), 3 ether);

        (,,,,,, Governance.ProposalState state) = governance.proposals(proposalId);
        assertEq(uint8(state), uint8(Governance.ProposalState.Executed));
    }

    function testCannotExecuteUnapprovedProposal() public {
        governance.createProposal("Build clinic", 3 ether);

        vm.expectRevert("Proposal is not approved");
        governance.executeProposal(proposalId);
    }
}
