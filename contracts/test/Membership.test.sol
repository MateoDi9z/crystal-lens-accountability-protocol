// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {MemberData, Membership} from "../src/Membership.sol";

contract TreasuryMock {
    bool public isContributorWithoutPendingContributionsResult = true;
    uint256 public decrementCalls;
    address public requestedContributor;
    uint256 public requestedAmount;

    function setIsContributorWithoutPendingContributionsResult(bool value) external {
        isContributorWithoutPendingContributionsResult = value;
    }

    function isContributorWithoutPendingContributions(address) external view returns (bool) {
        return isContributorWithoutPendingContributionsResult;
    }

    function decrementContributorCount() external {
        decrementCalls++;
    }

    function requestContribution(address contributor, uint256 amount) external {
        requestedContributor = contributor;
        requestedAmount = amount;
    }
}

contract MembershipTest is Test {
    Membership membership;
    TreasuryMock treasury;

    address owner = address(this);

    address alice = address(1);
    address bob = address(2);

    function setUp() public {
        treasury = new TreasuryMock();
        membership = new Membership("CLAP Membership 1", "CLAP-001", owner);
        membership.setTreasury(address(treasury));
    }

    // =========================
    // DEPLOYMENT
    // =========================

    function testDeployment() public view {
        assertEq(membership.name(), "CLAP Membership 1");
        assertEq(membership.symbol(), "CLAP-001");
        assertEq(membership.owner(), owner);
    }

    // =========================
    // MINTING
    // =========================

    function testMintMember() public {
        uint256 tokenId = membership.mint(alice, MemberData("12345678", "Alice Smith"));

        assertEq(membership.balanceOf(alice), 1);
        assertEq(membership.ownerOf(tokenId), alice);
        assertEq(membership.getMemberTokenId(alice), tokenId);
    }

    function testRegisterContributorSingleTx() public {
        uint256 tokenId = membership.registerContributor(alice, MemberData("12345678", "Alice Smith"), 1 ether);

        assertEq(membership.balanceOf(alice), 1);
        assertEq(membership.ownerOf(tokenId), alice);
        assertEq(treasury.requestedContributor(), alice);
        assertEq(treasury.requestedAmount(), 1 ether);
    }

    function testCannotMintTwice() public {
        membership.mint(alice, MemberData("12345678", "Alice Smith"));

        vm.expectRevert("Already member");
        membership.mint(alice, MemberData("12345678", "Alice Smith"));
    }

    function testNonOwnerCannotMint() public {
        vm.prank(alice);

        vm.expectRevert();
        membership.mint(bob, MemberData("87654321", "Bob Jones"));
    }

    function testTokenIdIncrements() public {
        uint256 tokenId1 = membership.mint(alice, MemberData("12345678", "Alice Smith"));
        uint256 tokenId2 = membership.mint(bob, MemberData("87654321", "Bob Jones"));

        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(membership.ownerOf(1), alice);
        assertEq(membership.ownerOf(2), bob);
    }

    // =========================
    // TOKEN URI
    // =========================

    function testSetTokenURI() public {
        uint256 tokenId = membership.mint(alice, MemberData("12345678", "Alice Smith"));

        membership.setTokenURI(tokenId, "https://example.com/metadata/1");

        assertEq(membership.tokenURI(tokenId), "https://example.com/metadata/1");
    }

    // =========================
    // MEMBER DATA (DNI, FULL NAME)
    // =========================

    function testSetMemberData() public {
        uint256 tokenId = membership.mint(alice, MemberData("12345678", "Alice Smith"));

        membership.setMemberData(tokenId, "12345678", "Alice Smith");

        MemberData memory data = membership.getMemberData(tokenId);
        assertEq(data.dni, "12345678");
        assertEq(data.fullName, "Alice Smith");
    }

    function testNonOwnerCannotSetMemberData() public {
        uint256 tokenId = membership.mint(alice, MemberData("12345678", "Alice Smith"));

        vm.prank(alice);
        vm.expectRevert();
        membership.setMemberData(tokenId, "12345678", "Alice Smith");
    }

    function testGetMemberDataRevertsForBurnedToken() public {
        uint256 tokenId = membership.mint(alice, MemberData("12345678", "Alice Smith"));
        membership.setMemberData(tokenId, "12345678", "Alice Smith");

        vm.prank(alice);
        membership.burn();

        vm.expectRevert();
        membership.getMemberData(tokenId);
    }

    function testNonOwnerCannotSetTokenURI() public {
        uint256 tokenId = membership.mint(alice, MemberData("12345678", "Alice Smith"));

        vm.prank(alice);
        vm.expectRevert();
        membership.setTokenURI(tokenId, "https://example.com/metadata/1");
    }

    // =========================
    // BURNING
    // =========================

    function testBurnMember() public {
        uint256 tokenId = membership.mint(alice, MemberData("12345678", "Alice Smith"));

        vm.prank(alice);
        membership.burn();

        assertEq(membership.balanceOf(alice), 0);
        assertEq(treasury.decrementCalls(), 1);
        vm.expectRevert();
        membership.ownerOf(tokenId);
    }

    function testNonMemberCannotBurn() public {
        vm.prank(bob);

        vm.expectRevert("Not a member");
        membership.burn();
    }

    function testBurnRevertsWhenTreasuryRejectsContributorStatus() public {
        membership.mint(alice, MemberData("12345678", "Alice Smith"));
        treasury.setIsContributorWithoutPendingContributionsResult(false);

        vm.prank(alice);
        vm.expectRevert("Not a contributor or contribution pending");
        membership.burn();
    }

    // =========================
    // SOULBOUND LOGIC
    // =========================

    function testCannotTransfer() public {
        membership.mint(alice, MemberData("12345678", "Alice Smith"));

        vm.prank(alice);
        vm.expectRevert("Non-transferable token");
        membership.transferFrom(alice, bob, 1);
    }

    function testCannotSafeTransfer() public {
        membership.mint(alice, MemberData("12345678", "Alice Smith"));

        vm.prank(alice);
        vm.expectRevert("Non-transferable token");
        membership.safeTransferFrom(alice, bob, 1);
    }

    function testCannotApprove() public {
        membership.mint(alice, MemberData("12345678", "Alice Smith"));

        vm.prank(alice);
        vm.expectRevert("Approvals disabled");
        membership.approve(bob, 1);
    }

    function testCannotSetApprovalForAll() public {
        membership.mint(alice, MemberData("12345678", "Alice Smith"));

        vm.prank(alice);
        vm.expectRevert("Approvals disabled");
        membership.setApprovalForAll(bob, true);
    }

    function testGetApprovedReturnsZero() public view {
        assertEq(membership.getApproved(1), address(0));
    }

    function testIsApprovedForAllReturnsFalse() public view {
        assertFalse(membership.isApprovedForAll(alice, bob));
    }

    // =========================
    // MEMBERSHIP LOGIC
    // =========================

    function testIsMember() public {
        assertFalse(membership.isMember(alice));

        membership.mint(alice, MemberData("12345678", "Alice Smith"));
        assertTrue(membership.isMember(alice));

        vm.prank(alice);
        membership.burn();
        assertFalse(membership.isMember(alice));
    }

    function testBurnRemovesMembership() public {
        membership.mint(alice, MemberData("12345678", "Alice Smith"));

        assertEq(membership.balanceOf(alice), 1);

        vm.prank(alice);
        membership.burn();

        assertEq(membership.balanceOf(alice), 0);
    }
}
