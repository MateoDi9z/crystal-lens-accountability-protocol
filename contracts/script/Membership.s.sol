// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;
//
import {Script} from "forge-std/Script.sol";
import {Membership} from "../src/Membership.sol";

contract MembershipScript is Script {
    Membership public membership;
    address public owner = address(1); // Complete with organization owner address

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        membership = new Membership("Crystal Lens Membership", "CLM", owner);

        vm.stopBroadcast();
    }
}
