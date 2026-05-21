// SPDX-License-Identifier: GNU Affero General Public License v3.0
import {Script} from "forge-std/Script.sol";

contract CounterScript is Script {
    Governance public governance;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        owner = address(0);
        governance = new Governance("0xCLAP");

        vm.stopBroadcast();
    }
}
