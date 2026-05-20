// SPDX-License-Identifier: GNU Affero General Public License v3.0
pragma solidity 0.8.30;

import {Script} from "forge-std/Script.sol";
import {Governance} from "../src/Governance.sol";

contract CounterScript is Script {
    Governance public governance;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        governance = new Governance(address(0)); // Pass the owner address here

        vm.stopBroadcast();
    }
}
