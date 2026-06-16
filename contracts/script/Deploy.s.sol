// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {Membership, MemberData} from "../src/Membership.sol";
import {Treasury} from "../src/Treasury.sol";
import {Governance} from "../src/Governance.sol";

contract DeployScript is Script {
    address constant OWNER = 0x26583527B405434313EC0A88F629Fb99B42E1e6D;

    function run() public {
        address alice = vm.addr(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78627d);
        address bob = vm.addr(0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804af9d1950);

        vm.startBroadcast(OWNER);

        Membership membership = new Membership("Crystal Lens Membership", "CLM", OWNER);
        Treasury treasury = new Treasury(address(membership), OWNER);
        Governance governance = new Governance(address(treasury), OWNER);

        membership.setTreasury(address(treasury));
        treasury.setGovernance(address(governance));

        membership.mint(alice, MemberData({dni: "30123456", fullName: "Alice Cooper"}));
        membership.mint(bob, MemberData({dni: "28987654", fullName: "Bob Martinez"}));

        treasury.requestContribution(alice, 1 ether);
        treasury.requestContribution(bob, 1 ether);

        governance.createProposal("Fund community event supplies", 0.5 ether);

        (bool success,) = address(treasury).call{value: 2 ether}("");
        require(success, "Treasury deposit failed");

        vm.stopBroadcast();

        console2.log("OWNER", OWNER);
        console2.log("ALICE", alice);
        console2.log("BOB", bob);
        console2.log("MEMBERSHIP", address(membership));
        console2.log("TREASURY", address(treasury));
        console2.log("GOVERNANCE", address(governance));
    }
}