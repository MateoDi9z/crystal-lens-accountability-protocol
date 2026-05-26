// SPDX-License-Identifier: GNU Affero General Public License v3.0
import {Script} from "forge-std/Script.sol";
import {Governance} from "../src/Governance.sol";

contract GovernanceScript is Script {
    Governance public governance;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        governance = new Governance();

        vm.stopBroadcast();
    }
}
