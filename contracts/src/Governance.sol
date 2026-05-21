// SPDX-License-Identifier: GNU Affero General Public License v3.0
pragma solidity 0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";
// Por ahora no puedo eliminar organizaciones o contribuidores
// es algo que queremos implementar? Deberiamos.
// Para asociar a los Contribuidores con las org podria hacer una struct que
// tenga una lista de ids
contract Governance is Ownable {
    enum ProposalStatus {
        Active,
        Approved,
        Rejected,
        Executed
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 amount;
        address payable recipient;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endBlock;
        ProposalStatus status;
    }

    uint256 public proposalCount;

    // lo unico que guardo es bool, para saber si esta registrado
    // pero podriamos guardar algo mas, porque al final es como 
    // tener una lista donde despues chequeo si esta (actualmente hace eso).
    mapping(address => bool) public organizations;
    // podria hacer que sea una address[] donde digo si esta asociado a una org
    // pero la cosa es que, podemos tener contribuidores que no esten asociados
    // a ninguna org?
    // mapping(address => address[]) public contributors;

    // este enfoque limita a que el contribuidor solo pueda estar asociado a una
    // org, lo cual nos facilitaria las cosas, aunque no soluciona la dependencia
    // que se crea si la org es removida.
    // mapping(address => address) public contributors;
    mapping(address => bool) public contributors;

    // una mejor idea seria hacer un mapa donde yo pueda ver de donde es member
    // mapping(address => mapping(address => bool)) public isMemberOf;

    mapping(uint256 => Proposal) public proposals;

    // proposalId => voter => voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Events
    event OrganizationAdded(address indexed organization);
    event ContributorAdded(address indexed contributor);

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer);

    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support
    );

    event ProposalFinalized(uint256 indexed proposalId, ProposalStatus status);

    modifier onlyOrganization() {
        require(organizations[msg.sender], "Not organization");
        _;
    }

    modifier onlyContributor() {
        // si no esta asociado a ninguna org no es un contribuidor
        require(contributors[msg.sender], "Not contributor");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        // The deployer of the contract is the initial owner
    }

    function addOrganization(address organization) external onlyOwner {
        organizations[organization] = true;

        emit OrganizationAdded(organization);
    }

    function addContributor(address contributor) external onlyOwner {
        contributors[contributor] = true;

        emit ContributorAdded(contributor);
    }

    function createProposal(
        string memory title,
        string memory description,
        uint256 amount,
        address payable recipient,
        uint256 durationInBlocks
    ) external onlyOrganization {
        proposalCount++;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            title: title,
            description: description,
            amount: amount,
            recipient: recipient,
            votesFor: 0,
            votesAgainst: 0,
            endBlock: block.number + durationInBlocks,
            status: ProposalStatus.Active
        });

        emit ProposalCreated(proposalCount, msg.sender);
    }

    function vote(uint256 proposalId, bool support) external onlyContributor {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");

        require(block.number <= proposal.endBlock, "Voting ended");

        require(
            proposal.status == ProposalStatus.Active,
            "Proposal not active"
        );

        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit Voted(proposalId, msg.sender, support);
    }

    function finalizeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");

        require(block.number > proposal.endBlock, "Voting not ended");

        require(proposal.status == ProposalStatus.Active, "Already finalized");

        if (proposal.votesFor > proposal.votesAgainst) {
            // Ask Treasury for money.
            proposal.status = ProposalStatus.Approved;
        } else {
            proposal.status = ProposalStatus.Rejected;
        }

        emit ProposalFinalized(proposalId, proposal.status);
    }

    // Getters
    function getProposal(
        uint256 proposalId
    ) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
}
