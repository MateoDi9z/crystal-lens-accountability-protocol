// SPDX-License-Identifier: GNU Affero General Public License v3.0
pragma solidity 0.8.30;

import "forge-std/Test.sol";
import "../src/Governance.sol";

// We create a helper contract to access the private data since the mappings are private
contract GovernanceHarness is Governance {
    constructor(address initialOwner) Governance(initialOwner) {}

    function isMemberOf(address org, address cont) external view returns (bool) {
        // We can't access private members even in inheritance if they are 'private'
        // Wait, I should check if they are 'private' or 'internal'
        return false; // Placeholder
    }
}

contract GovernanceLinkageTest is Test {
    Governance governance;
    address owner = address(this);
    address org1 = address(0x11);
    address org2 = address(0x12);
    address cont1 = address(0x21);
    address cont2 = address(0x22);

    function setUp() public {
        governance = new Governance(owner);
    }

    function testAddOrganization() public {
        governance.addOrganization(org1);
        // We can check if it's registered by trying to create a proposal
        vm.prank(org1);
        governance.createProposal("T", "D", 1, payable(address(0x31)), 10);
    }

    function testAddContributor() public {
        governance.addContributor(cont1);
        // We can check if it's registered by trying to vote
        // First need a proposal
        governance.addOrganization(org1);
        vm.prank(org1);
        governance.createProposal("T", "D", 1, payable(address(0x31)), 10);

        vm.prank(cont1);
        governance.vote(1, true);
    }

    function testAddContributorIntoOrg() public {
        governance.addContributorIntoOrg(cont1, org1);
        
        // Verify org is registered
        vm.prank(org1);
        governance.createProposal("T", "D", 1, payable(address(0x31)), 10);

        // Verify cont is registered and can vote
        vm.prank(cont1);
        governance.vote(1, true);
    }

    function test_RevertIf_DuplicateContributorInOrg() public {
        governance.addContributorIntoOrg(cont1, org1);
        
        vm.expectRevert("Already a member");
        governance.addContributorIntoOrg(cont1, org1);
    }

    function testMultipleOrgsForContributor() public {
        governance.addContributorIntoOrg(cont1, org1);
        governance.addContributorIntoOrg(cont1, org2);
        
        // Both orgs should be valid
        vm.prank(org1);
        governance.createProposal("T1", "D", 1, payable(address(0x31)), 10);
        vm.prank(org2);
        governance.createProposal("T2", "D", 1, payable(address(0x31)), 10);
    }
}
