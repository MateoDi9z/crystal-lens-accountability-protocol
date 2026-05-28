// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {Membership} from "../src/Membership.sol";
import {Treasury} from "../src/Treasury.sol";

contract TreasuryMock is Treasury {
    bool public isContributorWithoutPendingContributionResult;

    constructor(address membershipAddress, address _owner) Treasury(membershipAddress, _owner) {
        isContributorWithoutPendingContributionResult = true;
    }

    function isContributorWithoutPendingContribution(address) public view returns (bool) {
        return isContributorWithoutPendingContributionResult;
    }
}


contract MembershipTest is Test {
    Membership membership;
    TreasuryMock treasury;

    address owner = address(this);
    address admin = address(5);

    address alice = address(1);
    address bob = address(2);

    function setUp() public {
        treasury = new TreasuryMock(admin, owner);
        membership = new Membership("CLAP Membership 1", "CLAP-001", owner);
        membership.setTreasury(address(treasury));
    }

    // =========================
    // DEPLOYMENT
    // =========================

    function testDeployment() public view {
        assertEq(membership.name(), "CLAP Membership 1");

        assertEq(membership.symbol(), "CLAP-001");

        assertEq(membership.decimals(), 0);

        assertEq(membership.owner(), owner);
    }

    // =========================
    // MINTING
    // =========================

    function testMintMember() public {
        membership.mint(alice);

        assertEq(membership.balanceOf(alice), 1);
    }

    function testCannotMintTwice() public {
        membership.mint(alice);

        vm.expectRevert("Already member");

        membership.mint(alice);
    }

    function testNonOwnerCannotMint() public {
        vm.prank(alice);

        vm.expectRevert();

        membership.mint(bob);
    }

    // =========================
    // BURNING
    // =========================

    function testBurnMember() public {
        membership.mint(alice);
        vm.prank(alice);

        membership.burn();
        assertEq(membership.balanceOf(alice), 0);
    }

    function testNonOwnerBurn() public {
        membership.mint(alice);

        vm.prank(alice);

        membership.burn();
    }

    // =========================
    // SOULBOUND LOGIC
    // =========================

    function testCannotTransfer() public {
        membership.mint(alice);

        vm.prank(alice);

        vm.expectRevert("Transfers disabled");

        bool res = membership.transfer(bob, 1);
        assertEq(res, false);
    }

    function testCannotTransferFrom() public {
        membership.mint(alice);

        vm.prank(alice);

        vm.expectRevert("Transfers disabled");

        bool res = membership.transferFrom(alice, bob, 1);
        assertEq(res, false);
    }

    function testCannotApprove() public {
        membership.mint(alice);

        vm.prank(alice);

        vm.expectRevert("Approvals disabled");

        membership.approve(bob, 1);
    }

    // =========================
    // MEMBERSHIP LOGIC
    // =========================

    function testIsMemberThroughBalance() public {
        assertEq(membership.balanceOf(alice), 0);

        membership.mint(alice);

        assertEq(membership.balanceOf(alice), 1);
    }

    function testBurnRemovesMembership() public {
        membership.mint(alice);

        assertEq(membership.balanceOf(alice), 1);

        vm.prank(alice);
        membership.burn();

        assertEq(membership.balanceOf(alice), 0);
    }
}
