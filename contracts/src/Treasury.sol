// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

import {Membership} from "./Membership.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Treasury is Ownable, ReentrancyGuard {
    Membership public immutable membership;
    address public governance;
    uint256 public totalFunds;

    mapping(address => uint256) public pendingContribution;
    mapping(address => uint256) public totalPaid;

    event GovernanceUpdated(address indexed previousGovernance, address indexed newGovernance);
    event ContributionRequested(address indexed contributor, uint256 amount);
    event ContributionPaid(address indexed contributor, uint256 amount);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsReleased(address indexed recipient, uint256 amount);

    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance can call");
        _;
    }

    constructor(address membershipAddress) Ownable(msg.sender) {
        require(membershipAddress != address(0), "Invalid membership address");
        membership = Membership(membershipAddress);
    }

    function setGovernance(address _governance) external onlyOwner {
        require(_governance != address(0), "Invalid governance address");
        address oldGov = governance;
        governance = _governance;
        emit GovernanceUpdated(oldGov, _governance);
    }

    function requestContribution(address contributor, uint256 amount) external onlyOwner {
        require(membership.isMember(contributor), "Not an active member");
        require(amount > 0, "Amount must be greater than 0");

        pendingContribution[contributor] += amount;
        emit ContributionRequested(contributor, amount);
    }

    function payContribution() external payable {
        uint256 pending = pendingContribution[msg.sender];
        require(pending > 0, "No pending contribution request");
        require(msg.value > 0, "Amount must be greater than 0");

        uint256 paidAmount = msg.value;
        if (paidAmount >= pending) {
            pendingContribution[msg.sender] = 0;
        } else {
            pendingContribution[msg.sender] -= paidAmount;
        }

        totalPaid[msg.sender] += paidAmount;
        totalFunds += paidAmount;

        emit ContributionPaid(msg.sender, paidAmount);
    }

    function deposit() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        totalFunds += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function releaseFunds(address payable recipient, uint256 amount) external onlyGovernance nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(totalFunds >= amount, "Insufficient active funds in treasury");

        totalFunds -= amount;

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit FundsReleased(recipient, amount);
    }

    receive() external payable {
        totalFunds += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
}
