// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {Membership, MemberData} from "../src/Membership.sol";
import {Treasury} from "../src/Treasury.sol";
import {Governance} from "../src/Governance.sol";

contract DeploySingleOrgScript is Script {
    function run() public {
        address targetOwner = vm.envOr("DEPLOY_ORG_OWNER", address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        address deployer = msg.sender;

        vm.startBroadcast();

        Membership membership = new Membership("Organizacion Local CLAP", "CLAP-LOCAL", deployer);
        Treasury treasury = new Treasury(address(membership), deployer);
        Governance governance = new Governance(address(treasury), deployer);

        membership.setTreasury(address(treasury));
        treasury.setGovernance(address(governance));

        if (targetOwner != deployer) {
            membership.transferOwnership(targetOwner);
            treasury.transferOwnership(targetOwner);
            governance.transferOwnership(targetOwner);
        }

        vm.stopBroadcast();

        console2.log("\n====================================");
        console2.log("DESPLIEGUE LOCAL EN ANVIL EXITOSO");
        console2.log("====================================");
        console2.log("Owner / Admin (Tu Wallet) ->", targetOwner);
        console2.log("- MEMBERSHIP  ->", address(membership));
        console2.log("- TREASURY    ->", address(treasury));
        console2.log("- GOVERNANCE  ->", address(governance));
        console2.log("====================================\n");
    }
}
