// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Script, console2} from "forge-std/Script.sol";
import {Treasury} from "../src/Treasury.sol";

contract TreasuryScript is Script {
    address public membership = address(0x5FbDB2315678afecb367f032d93F642f64180aa3);
    address public owner = address(0x26583527B405434313EC0A88F629Fb99B42E1e6D);

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        Treasury treasury = new Treasury(membership, owner);

        vm.stopBroadcast();

        console2.log("TREASURY", address(treasury));
        console2.log("MEMBERSHIP", membership);
        console2.log("OWNER", owner);
    }
}