// SPDX-License-Identifier: GNU Affero General Public License v3.0
pragma solidity 0.8.30;

import "forge-std/Test.sol";
import "../src/Membership.sol";

contract MembershipTest is Test {
    Membership membership;

    address owner = address(this);

    address alice = address(1);
    address bob = address(2);

    function setUp() public {
        membership = new Membership(
            "CLAP Membership 1",
            "CLAP-001"
        );
    }

    // =========================
    // DEPLOYMENT
    // =========================

    function testDeployment() public view {
        assertEq(
            membership.name(),
            "CLAP Membership 1"
        );

        assertEq(
            membership.symbol(),
            "CLAP-001"
        );

        assertEq(
            membership.decimals(),
            0
        );

        assertEq(
            membership.owner(),
            owner
        );
    }

    // =========================
    // MINTING
    // =========================

    function testMintMember() public {
        membership.mint(alice);

        assertEq(
            membership.balanceOf(alice),
            1
        );
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

        membership.burn(alice);

        assertEq(
            membership.balanceOf(alice),
            0
        );
    }

    function testNonOwnerCannotBurn() public {
        membership.mint(alice);

        vm.prank(alice);

        vm.expectRevert();

        membership.burn(alice);
    }

    // =========================
    // SOULBOUND LOGIC
    // =========================

    function testCannotTransfer() public {
        membership.mint(alice);

        vm.prank(alice);

        vm.expectRevert("Transfers disabled");

        membership.transfer(bob, 1);
    }

    function testCannotTransferFrom() public {
        membership.mint(alice);

        vm.prank(alice);

        vm.expectRevert("Transfers disabled");

        membership.transferFrom(
            alice,
            bob,
            1
        );
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
        assertEq(
            membership.balanceOf(alice),
            0
        );

        membership.mint(alice);

        assertEq(
            membership.balanceOf(alice),
            1
        );
    }

    function testBurnRemovesMembership() public {
        membership.mint(alice);

        assertEq(
            membership.balanceOf(alice),
            1
        );

        membership.burn(alice);

        assertEq(
            membership.balanceOf(alice),
            0
        );
    }
}