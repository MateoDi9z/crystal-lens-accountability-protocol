// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.30;

// Membership.sol
// └── soulbound memberships ERC721

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ITreasury {
    function isContributorWithoutPendingContributions(address user) external view returns (bool);

    function decrementContributorCount() external;

    function requestContribution(address contributor, uint256 amount) external;
}

struct MemberData {
    string dni;
    string fullName;
}

contract Membership is ERC721, Ownable {
    ITreasury public treasury;

    uint256 private _nextTokenId = 1;
    mapping(address => uint256) private _memberTokenId;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => MemberData) private _memberData;

    event MemberAdded(address indexed member, uint256 indexed tokenId);
    event MemberRemoved(address indexed member, uint256 indexed tokenId);
    event MemberDataUpdated(uint256 indexed tokenId, string dni, string fullName);

    constructor(string memory name_, string memory symbol_, address initialOwner)
        ERC721(name_, symbol_)
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), "Invalid owner");
    }

    function setTreasury(address treasury_) external onlyOwner {
        require(treasury_ != address(0), "Invalid treasury");

        treasury = ITreasury(treasury_);
    }

    modifier whenTreasurySet() {
        require(address(treasury) != address(0), "Treasury not set");
        _;
    }

    // =========================
    // GETTERS
    // =========================

    function isMember(address user) public view returns (bool) {
        return balanceOf(user) > 0;
    }

    function getMemberTokenId(address member) external view returns (uint256) {
        require(isMember(member), "Not a member");
        return _memberTokenId[member];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory uri = _tokenURIs[tokenId];
        if (bytes(uri).length > 0) return uri;

        return super.tokenURI(tokenId);
    }

    function getMemberData(uint256 tokenId) external view returns (MemberData memory) {
        _requireOwned(tokenId);

        return _memberData[tokenId];
    }

    // =========================
    // MEMBERSHIP LOGIC
    // =========================

    function _mintMemberInternal(address to, MemberData calldata memberData) internal returns (uint256) {
        require(to != address(0), "Invalid address");
        require(!isMember(to), "Already member");
        require(bytes(memberData.dni).length > 0, "DNI required");
        require(bytes(memberData.fullName).length > 0, "Full name required");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _memberTokenId[to] = tokenId;
        _memberData[tokenId] = memberData;
        emit MemberAdded(to, tokenId);
        return tokenId;
    }

    function mint(address to, MemberData calldata memberData) external onlyOwner whenTreasurySet returns (uint256) {
        return _mintMemberInternal(to, memberData);
    }

    function registerContributor(
        address to,
        MemberData calldata memberData,
        uint256 initialContribution
    ) external onlyOwner whenTreasurySet returns (uint256) {
        uint256 tokenId = _mintMemberInternal(to, memberData);
        if (initialContribution > 0) {
            treasury.requestContribution(to, initialContribution);
        }
        return tokenId;
    }

    function setTokenURI(uint256 tokenId, string memory uri) external onlyOwner {
        _requireOwned(tokenId);

        _tokenURIs[tokenId] = uri;
    }

    function setMemberData(uint256 tokenId, string calldata dni, string calldata fullName) external onlyOwner {
        _requireOwned(tokenId);

        _memberData[tokenId] = MemberData(dni, fullName);
        emit MemberDataUpdated(tokenId, dni, fullName);
    }

    function burn() external whenTreasurySet {
        require(isMember(msg.sender), "Not a member");
        require(
            treasury.isContributorWithoutPendingContributions(msg.sender), "Not a contributor or contribution pending"
        );

        uint256 tokenId = _memberTokenId[msg.sender];
        delete _memberTokenId[msg.sender];
        delete _tokenURIs[tokenId];
        delete _memberData[tokenId];
        _burn(tokenId);
        treasury.decrementContributorCount();
        emit MemberRemoved(msg.sender, tokenId);
    }

    // =========================
    // SOULBOUND LOGIC
    // =========================

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert("Non-transferable token");
        }

        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override {
        revert("Approvals disabled");
    }

    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Approvals disabled");
    }

    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
    }
}
