// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

// Membership.sol
// └── soulbound memberships ERC20

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Membership is ERC20, Ownable {
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(msg.sender) {}

    // =========================
    // GETTERS
    // =========================

    function isMember(address user) public view returns (bool) {
        return balanceOf(user) > 0;
    }

    // =========================
    // MEMBERSHIP LOGIC
    // =========================

    function mint(address to) external onlyOwner {
        require(to != address(0), "Invalid address");

        require(!isMember(to), "Already member");

        _mint(to, 1);
        emit MemberAdded(to);
    }

    function burn(address from) external onlyOwner {
        require(isMember(from), "Not a member");

        _burn(from, 1);
        emit MemberRemoved(from);
    }

    // =========================
    // ERC20 SETTINGS
    // =========================

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    // =========================
    // SOULBOUND LOGIC
    // =========================

    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }

        revert("Non-transferable token");
    }

    // =========================
    // DISABLE APPROVALS
    // =========================

    function approve(address, uint256) public pure override returns (bool) {
        revert("Approvals disabled");
    }

    function transfer(address, uint256) public pure override returns (bool) {
        revert("Transfers disabled");
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("Transfers disabled");
    }
}
