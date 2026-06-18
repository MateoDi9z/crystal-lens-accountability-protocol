// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {Membership, MemberData} from "../src/Membership.sol";
import {Treasury} from "../src/Treasury.sol";
import {Governance} from "../src/Governance.sol";

contract DeployScript is Script {

    function run() public {
        address owner = vm.envAddress("DEPLOY_ORG_OWNER");

        vm.startBroadcast();

        // === ORG 1 ===
        deployOrg(
            "Municipalidad de Campana", 
            "CAMP", 
            owner
        );

        // === ORG 2 ===
        deployOrg(
            "Club Ciudad de Campana", 
            "CCC", 
            owner
        );

        // === ORG 3 ===
        deployOrg(
            "Club Atletico Boca Juniors", 
            "CABJ", 
            owner
        );

        vm.stopBroadcast();
    }

    /**
     * @dev Despliega una organización completa (Membership + Treasury + Governance)
     */
    function deployOrg(
        string memory name,
        string memory symbol,
        address owner
    ) internal {
        Membership membership = new Membership(name, symbol, owner);
        Treasury treasury = new Treasury(address(membership), owner);
        Governance governance = new Governance(address(treasury), owner);

        // Configurar conexiones cruzadas
        membership.setTreasury(address(treasury));
        treasury.setGovernance(address(governance));

        // Logs
        console2.log("====================================");
        console2.log(string.concat("# ", name));
        console2.log("Symbol:", symbol);
        console2.log("Owner:", owner);
        console2.log("- MEMBERSHIP  ->", address(membership));
        console2.log("- TREASURY    ->", address(treasury));
        console2.log("- GOVERNANCE  ->", address(governance));
        console2.log("====================================\n");
    }
}