// SPDX-License-Identifier: GNU Affero General Public License v3.0
pragma solidity 0.8.30;

import "forge-std/Test.sol";
import "../src/Governance.sol";

contract GovernanceTest is Test {
    Governance governance;

    address owner = address(this);

    address organization = address(1);

    address contributor1 = address(2);
    address contributor2 = address(3);

    address recipient = payable(address(4));

    function setUp() public {
        governance = new Governance(owner);

        governance.addOrganization(organization);

        governance.addContributor(contributor1);
        governance.addContributor(contributor2);
    }

    function testOrganizationCanCreateProposal() public {
        vm.prank(organization);

        governance.createProposal(
            "Build Hospital",
            "New public hospital",
            100 ether,
            payable(recipient),
            10
        );

        Governance.Proposal memory proposal = governance.getProposal(1);

        assertEq(proposal.id, 1);
        assertEq(proposal.proposer, organization);
        assertEq(proposal.title, "Build Hospital");
        assertEq(
            uint256(proposal.status),
            uint256(Governance.ProposalStatus.Active)
        );
    }

    function testNonOrganizationCannotCreateProposal() public {
        vm.prank(contributor1);

        vm.expectRevert("Not organization");

        governance.createProposal(
            "Hack",
            "Hack",
            1 ether,
            payable(recipient),
            10
        );
    }

    function testContributorCanVote() public {
        vm.prank(organization);

        governance.createProposal(
            "Road Repair",
            "Fix roads",
            50 ether,
            payable(recipient),
            10
        );

        vm.prank(contributor1);

        governance.vote(1, true);

        Governance.Proposal memory proposal = governance.getProposal(1);

        assertEq(proposal.votesFor, 1);
        assertEq(proposal.votesAgainst, 0);
    }

    function testCannotVoteTwice() public {
        vm.prank(organization);

        governance.createProposal(
            "Bridge",
            "Build bridge",
            50 ether,
            payable(recipient),
            10
        );

        vm.prank(contributor1);
        governance.vote(1, true);

        vm.prank(contributor1);

        vm.expectRevert("Already voted");

        governance.vote(1, true);
    }

    function testNonContributorCannotVote() public {
        vm.prank(organization);

        governance.createProposal(
            "School",
            "New school",
            30 ether,
            payable(recipient),
            10
        );

        vm.prank(address(999));

        vm.expectRevert("Not contributor");

        governance.vote(1, true);
    }

    function testFinalizeApprovedProposal() public {
        vm.prank(organization);

        governance.createProposal(
            "Water System",
            "Improve water",
            20 ether,
            payable(recipient),
            10
        );

        vm.prank(contributor1);
        governance.vote(1, true);

        vm.prank(contributor2);
        governance.vote(1, true);

        vm.roll(block.number + 11);

        governance.finalizeProposal(1);

        Governance.Proposal memory proposal = governance.getProposal(1);

        assertEq(
            uint256(proposal.status),
            uint256(Governance.ProposalStatus.Approved)
        );
    }

    function testFinalizeRejectedProposal() public {
        vm.prank(organization);

        governance.createProposal(
            "Random Proposal",
            "Random",
            20 ether,
            payable(recipient),
            10
        );

        vm.prank(contributor1);
        governance.vote(1, false);

        vm.roll(block.number + 11);

        governance.finalizeProposal(1);

        (, , , , , , , , , Governance.ProposalStatus status) = governance
            .proposals(1);

        assertEq(uint256(status), uint256(Governance.ProposalStatus.Rejected));
    }

    function testCannotFinalizeBeforeEnd() public {
        vm.prank(organization);

        governance.createProposal(
            "Too Early",
            "Too Early",
            20 ether,
            payable(recipient),
            10
        );

        vm.expectRevert("Voting not ended");

        governance.finalizeProposal(1);
    }
}
