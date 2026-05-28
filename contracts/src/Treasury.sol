// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

// Treasury.sol
// ├── fondos
// ├── balances
// ├── pendingDebt
// ├── payments
// └── releases

import {Membership} from "./Membership.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Treasury is Ownable, ReentrancyGuard {
    Membership public immutable membership;
    address public governance;
    uint256 public totalFunds;

    mapping(address => uint256) public pendingContribution;
    mapping(address => uint256) public totalPaid;
    uint256 contributorCount;

    event GovernanceUpdated(address indexed previousGovernance, address indexed newGovernance);
    event ContributionRequested(address indexed contributor, uint256 amount);
    event ContributionPaid(address indexed contributor, uint256 amount);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsReleased(address indexed recipient, uint256 amount);

    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance can call");
        _;
    }

    modifier onlyMember() {
        require(membership.isMember(msg.sender), "Only members can call");
        _;
    }

    constructor(address membershipAddress, address _owner) Ownable(_owner) {
        require(membershipAddress != address(0), "Invalid membership address");
        require(_owner != address(0), "Invalid owner address");
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

        if (pendingContribution[contributor] == 0 && totalPaid[contributor] == 0) {
            contributorCount += 1;
        }
        pendingContribution[contributor] += amount;
        emit ContributionRequested(contributor, amount);
    }

    function payContribution() external payable onlyMember {
        require(msg.value > 0, "Amount must be greater than 0");

        uint256 pending = pendingContribution[msg.sender];
        require(pending > 0, "No pending contribution request");

        totalPaid[msg.sender] += msg.value;
        totalFunds += msg.value;

        emit ContributionPaid(msg.sender, msg.value);
    }

    function deposit() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        if (pendingContribution[msg.sender] == 0 && totalPaid[msg.sender] == 0) {
            contributorCount += 1;
        }
        totalPaid[msg.sender] += msg.value;
        totalFunds += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function getContributorCount() public view returns (uint256) {
        return contributorCount;
    }

    function isContributor(address contributor) public view returns (bool) {
        return totalPaid[contributor] > 0 || pendingContribution[contributor] > 0;
    }

    function isContributorWithoutPendingContributions(address contributor) public view returns (bool) {
        require(isContributor(contributor), "Not a contributor registered");
        return totalPaid[contributor] >= pendingContribution[contributor];
    }

    function releaseFunds(address payable recipient, uint256 amount) external onlyGovernance nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(totalFunds >= amount, "Insufficient active funds in treasury");

        totalFunds -= amount;

        recipient.transfer(amount);

        emit FundsReleased(recipient, amount);
    }

    receive() external payable {
        if (msg.value > 0) {
            if (pendingContribution[msg.sender] == 0 && totalPaid[msg.sender] == 0) {
                contributorCount += 1;
            }
            totalPaid[msg.sender] += msg.value;
        }
        totalFunds += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
}
