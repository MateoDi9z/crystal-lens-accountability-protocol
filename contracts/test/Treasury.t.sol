// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {Membership} from "../src/Membership.sol";
import {Treasury} from "../src/Treasury.sol";

// Mock contract to test reentrancy security on releaseFunds
contract ReentrantAttacker {
    Treasury public treasury;
    uint256 public callCount;

    constructor(address _treasury) {
        treasury = Treasury(payable(_treasury));
    }

    // Fallback attempts to call releaseFunds again
    receive() external payable {
        callCount++;
        if (callCount < 2) {
            treasury.releaseFunds(payable(address(this)), 1 ether);
        }
    }

    function attack() external {
        treasury.releaseFunds(payable(address(this)), 1 ether);
    }
}

contract TreasuryTest is Test {
    Membership public membership;
    Treasury public treasury;

    address public owner = address(this);
    address public governance = address(0xBA5E);
    address public alice = address(0xA11C3);
    address public bob = address(0xB0B);
    address public stranger = address(0xD3AD);

    function setUp() public {
        // 1. Deploy soulbound Membership token
        membership = new Membership("CLAP Org", "CLAP");

        // 2. Deploy Treasury passing Membership address
        treasury = new Treasury(address(membership));

        // 3. Configure authorized Governance address
        treasury.setGovernance(governance);

        // 4. Mint memberships to Alice and Bob (making them active members)
        membership.mint(alice);
        membership.mint(bob);

        // Fund test accounts and this contract for testing payable transactions
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(stranger, 10 ether);
        vm.deal(governance, 10 ether);
        vm.deal(address(this), 10 ether);
    }

    // ==========================================
    // DEPLOYMENT & SETTINGS
    // ==========================================

    function testDeployment() public view {
        assertEq(address(treasury.membership()), address(membership));
        assertEq(treasury.owner(), owner);
        assertEq(treasury.governance(), governance);
        assertEq(treasury.totalFunds(), 0);
    }

    function testSetGovernance() public {
        address newGov = address(0x9999);
        treasury.setGovernance(newGov);
        assertEq(treasury.governance(), newGov);
    }

    function testCannotSetGovernanceByNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        treasury.setGovernance(stranger);
    }

    function testCannotSetGovernanceToZero() public {
        vm.expectRevert("Invalid governance address");
        treasury.setGovernance(address(0));
    }

    // ==========================================
    // CONTRIBUTION REQUESTS
    // ==========================================

    function testRequestContribution() public {
        treasury.requestContribution(alice, 1.5 ether);
        assertEq(treasury.pendingContribution(alice), 1.5 ether);

        // Accumulates correctly
        treasury.requestContribution(alice, 0.5 ether);
        assertEq(treasury.pendingContribution(alice), 2.0 ether);
    }

    function testCannotRequestContributionForNonMember() public {
        vm.expectRevert("Not an active member");
        treasury.requestContribution(stranger, 1 ether);
    }

    function testCannotRequestContributionByNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        treasury.requestContribution(alice, 1 ether);
    }

    function testCannotRequestZeroContribution() public {
        vm.expectRevert("Amount must be greater than 0");
        treasury.requestContribution(alice, 0);
    }

    // ==========================================
    // PAYING CONTRIBUTIONS
    // ==========================================

    function testPayContributionExact() public {
        treasury.requestContribution(alice, 2 ether);

        vm.prank(alice);
        treasury.payContribution{value: 2 ether}();

        assertEq(treasury.pendingContribution(alice), 0);
        assertEq(treasury.totalPaid(alice), 2 ether);
        assertEq(treasury.totalFunds(), 2 ether);
        assertEq(address(treasury).balance, 2 ether);
    }

    function testPayContributionPartial() public {
        treasury.requestContribution(alice, 2 ether);

        vm.prank(alice);
        treasury.payContribution{value: 0.8 ether}();

        assertEq(treasury.pendingContribution(alice), 1.2 ether);
        assertEq(treasury.totalPaid(alice), 0.8 ether);
        assertEq(treasury.totalFunds(), 0.8 ether);
    }

    function testPayContributionOverpayment() public {
        treasury.requestContribution(alice, 2 ether);

        vm.prank(alice);
        treasury.payContribution{value: 3 ether}(); // Overpays by 1 ETH

        assertEq(treasury.pendingContribution(alice), 0);
        assertEq(treasury.totalPaid(alice), 3 ether);
        assertEq(treasury.totalFunds(), 3 ether);
        assertEq(address(treasury).balance, 3 ether);
    }

    function testCannotPayContributionWithoutRequest() public {
        vm.prank(alice);
        vm.expectRevert("No pending contribution request");
        treasury.payContribution{value: 1 ether}();
    }

    function testCannotPayContributionWithZeroValue() public {
        treasury.requestContribution(alice, 2 ether);

        vm.prank(alice);
        vm.expectRevert("Amount must be greater than 0");
        treasury.payContribution{value: 0}();
    }

    // ==========================================
    // FREE DEPOSITS & RECEIVE FALLBACK
    // ==========================================

    function testDirectDeposit() public {
        vm.prank(stranger);
        treasury.deposit{value: 5 ether}();

        assertEq(treasury.totalFunds(), 5 ether);
        assertEq(address(treasury).balance, 5 ether);
    }

    function testCannotDepositZero() public {
        vm.expectRevert("Amount must be greater than 0");
        treasury.deposit{value: 0}();
    }

    function testReceiveFallback() public {
        // Direct transfer to contract address
        (bool success, ) = address(treasury).call{value: 4 ether}("");
        assertTrue(success);

        assertEq(treasury.totalFunds(), 4 ether);
        assertEq(address(treasury).balance, 4 ether);
    }

    // ==========================================
    // RELEASING FUNDS
    // ==========================================

    function testReleaseFunds() public {
        // 1. Put some money in the treasury
        treasury.deposit{value: 10 ether}();
        assertEq(treasury.totalFunds(), 10 ether);

        uint256 recipientBalanceBefore = alice.balance;

        // 2. Call releaseFunds as governance
        vm.prank(governance);
        treasury.releaseFunds(payable(alice), 4 ether);

        assertEq(treasury.totalFunds(), 6 ether);
        assertEq(address(treasury).balance, 6 ether);
        assertEq(alice.balance, recipientBalanceBefore + 4 ether);
    }

    function testCannotReleaseFundsByNonGovernance() public {
        treasury.deposit{value: 10 ether}();

        vm.prank(stranger);
        vm.expectRevert("Only governance can call");
        treasury.releaseFunds(payable(alice), 1 ether);
    }

    function testCannotReleaseFundsToZeroAddress() public {
        treasury.deposit{value: 10 ether}();

        vm.prank(governance);
        vm.expectRevert("Invalid recipient");
        treasury.releaseFunds(payable(address(0)), 1 ether);
    }

    function testCannotReleaseZeroFunds() public {
        treasury.deposit{value: 10 ether}();

        vm.prank(governance);
        vm.expectRevert("Amount must be greater than 0");
        treasury.releaseFunds(payable(alice), 0);
    }

    function testCannotReleaseFundsInsufficientBalance() public {
        treasury.deposit{value: 5 ether}();

        vm.prank(governance);
        vm.expectRevert("Insufficient active funds in treasury");
        treasury.releaseFunds(payable(alice), 6 ether);
    }

    // ==========================================
    // REENTRANCY PROTECTION
    // ==========================================

    function testReentrancyGuardOnRelease() public {
        // Deploy attacker contract
        ReentrantAttacker attacker = new ReentrantAttacker(address(treasury));
        
        // Deposit 5 ETH to Treasury
        treasury.deposit{value: 5 ether}();

        // Authorize this test contract as governance to call releaseFunds
        treasury.setGovernance(address(this));

        // Attempting to call releaseFunds transferring to attacker contract
        // The attacker contract fallback will trigger another call to releaseFunds
        // It should revert due to ReentrancyGuard (Failed to execute internal call / ReentrancyGuardReentrantCall)
        vm.expectRevert();
        attacker.attack();
    }
}
