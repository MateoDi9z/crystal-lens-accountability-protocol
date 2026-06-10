# CLAP — Arquitectura de Smart Contracts

## Contexto General

CLAP (Crystal Lens Accountability Protocol) es un sistema de gobernanza para organizaciones que administran fondos comunes. Todo ocurre on-chain — sin backend, sin base de datos, únicamente smart contracts y eventos.

## Modelo Arquitectónico

```
1 organización = 1 set de contratos
```

```
Membership.sol   (ERC721 soulbound)
Treasury.sol     (fondos + contribuciones)
Governance.sol   (propuestas + votación)
```

---

## Membership.sol — ERC721 Soulbound

### Responsabilidad
Gestionar la identidad de los miembros mediante tokens no transferibles (soulbound).

### Contrato
```solidity
contract Membership is ERC721, Ownable
```

### Modelo
Cada miembro recibe **1 token ERC721** (NFT) que representa su pertenencia:
- **Non-transferable** — no se puede vender, transferir ni delegar
- **MemberData** adjunto al token: `dni` (string) y `fullName` (string)
- Soporta `tokenURI` por token para metadata

### Funciones principales

| Función | Acceso | Descripción |
|---------|--------|-------------|
| `mint(to)` | onlyOwner | Mintea un NFT a un nuevo miembro |
| `burn()` | member | Auto-eliminación si no tiene pending contributions |
| `setTokenURI(tokenId, uri)` | onlyOwner | Metadata del NFT |
| `setMemberData(tokenId, dni, fullName)` | onlyOwner | Datos de identidad |
| `isMember(user)` | public | `balanceOf(user) > 0` |
| `getMemberTokenId(member)` | view | Token ID del miembro |
| `getMemberData(tokenId)` | view | DNI y nombre del miembro |

### Soulbound Logic
```solidity
function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
    address from = _ownerOf(tokenId);
    if (from != address(0) && to != address(0)) {
        revert("Non-transferable token");
    }
    return super._update(to, tokenId, auth);
}
```
- No se permite transferencia entre addresses no-zero
- `approve()`, `getApproved()`, `setApprovalForAll()`, `isApprovedForAll()` están deshabilitados

### Dependencias
Membership conoce `ITreasury` para verificar `isContributorWithoutPendingContributions()` al hacer `burn()`.

---

## Treasury.sol — Fondos y Contribuciones

### Responsabilidad
Custodiar fondos, trackear contribuciones pendientes y pagadas, y liberar fondos cuando Governance lo aprueba.

### Contrato
```solidity
contract Treasury is Ownable, ReentrancyGuard
```

### Storage
```solidity
IMembership public immutable membership;
address public governance;
uint256 public totalFunds;
mapping(address => uint256) public pendingContribution;
mapping(address => uint256) public totalPaid;
uint256 contributorCount;
```

### Funciones principales

| Función | Acceso | Descripción |
|---------|--------|-------------|
| `requestContribution(contributor, amount)` | onlyOwner | Asigna contribución pendiente |
| `payAllPendingContribution()` | onlyMember, payable | Paga el monto exacto pendiente |
| `releaseFunds(recipient, amount)` | onlyGovernance, nonReentrant | Libera fondos a un recipient |
| `getContributorCount()` | view | Total de contribuyentes registrados |
| `getPendingContribution(contributor)` | view | Deuda pendiente |
| `isContributor(user)` | view | `totalPaid > 0 \|\| pendingContribution > 0` |
| `isContributorWithoutPendingContributions(user)` | view | `totalPaid >= pendingContribution` |
| `decrementContributorCount()` | onlyMembership | Reduce contador al hacer burn |

### Reglas importantes
- `payAllPendingContribution()` requiere que `msg.value == pendingContribution` (pago exacto, no parcial)
- `receive()` permite depósitos directos de ETH
- Solo Governance puede liberar fondos
- ReentrancyGuard activo en `releaseFunds`

---

## Governance.sol — Propuestas y Votación

### Responsabilidad
Gestionar propuestas, votación y ejecución de gastos aprobados.

### Contrato
```solidity
contract Governance is Ownable
```

### Proposal
```solidity
struct Proposal {
    uint256 id;
    address proposer;
    string description;
    uint256 amount;
    uint256 forVotes;
    uint256 againstVotes;
    ProposalState state;  // Pending | Approved | Rejected | Executed
}
```

### Storage
```solidity
ITreasury public immutable treasury;
mapping(uint256 => Proposal) public proposals;
mapping(uint256 => mapping(address => bool)) public voted;
uint256 private _nextProposalId;
```

### Funciones principales

| Función | Acceso | Descripción |
|---------|--------|-------------|
| `createProposal(description, amount)` | onlyOwner | Crea nueva propuesta |
| `vote(id, support)` | contributor | Vota a favor o en contra |
| `executeProposal(id)` | public | Ejecuta propuesta aprobada |
| `getProposal(id)` | view | Datos de la propuesta |
| `isApproved(id)` / `isPending(id)` / `isExecuted(id)` | view | Estado helpers |

### Reglas de Votación
1. Solo contributors (con pending o no) pueden votar
2. Un voto por persona por propuesta
3. `forVotes` y `againstVotes` se incrementan según `_support`
4. **Auto-resolución**: después de cada voto, si `forVotes >= threshold` → Approved, si `againstVotes >= threshold` → Rejected
5. Threshold = `(totalContributors + 1) / 2` (>50%)

### Ejecución
```solidity
function executeProposal(uint256 _id) external {
    Proposal storage proposal = proposals[_id];
    require(proposal.state == ProposalState.Approved, "Proposal is not approved");
    address payable recipient = payable(owner());
    proposal.state = ProposalState.Executed;
    treasury.releaseFunds(recipient, proposal.amount);
}
```
- Los fondos se liberan al `owner()` del contrato Governance
- No hay `endBlock` ni `recipient` configurable en la propuesta

---

## Flujo Completo

```
1. Deploy
   Owner deployea Membership, Treasury, Governance
   Owner configura Treasury en Membership
   Owner configura Governance en Treasury

2. Registrar miembro
   Owner → Membership.mint(user)
   Membership mintea ERC721
   Owner → Treasury.requestContribution(user, amount)

3. Contribuir
   Miembro → Treasury.payAllPendingContribution{value: amount}()
   pendingContribution[user] = 0

4. Crear propuesta
   Owner → Governance.createProposal("description", amount)

5. Votar
   Contributor → Governance.vote(id, true/false)
   Si forVotes >= threshold → Approved
   Si againstVotes >= threshold → Rejected

6. Ejecutar
   Cualquiera → Governance.executeProposal(id)
   Governance → Treasury.releaseFunds(owner, amount)
```

## Decisiones de Diseño

| Decisión | Razón |
|----------|-------|
| ERC721 en vez de ERC20 | Identidad única por miembro, metadata adjunta, sin fraccionamiento |
| Soulbound | Evita venta/delegación de membresía |
| Pago exacto | Simplifica contabilidad, evita decimales |
| Auto-resolución | Sin deadlines, sin timeouts, resolución inmediata al alcanzar mayoría |
| Un deploy por org | Aísla completamente cada organización |
| Owner crea proposals | Control centralizado del uso de fondos |
| Sin snapshots | Reducción de complejidad |

## Testing

### Membership
- mint member
- burn member (con y sin pending)
- prevent transfers
- prevent approvals
- set/read member data
- set token URI

### Treasury
- request contribution
- pay exact contribution
- reject partial payment
- release funds (solo governance)
- reject non-member payments
- reentrancy protection

### Governance
- create proposal (solo owner)
- vote for/against
- prevent double vote
- reject non-contributors
- auto-approve at threshold
- auto-reject at threshold
- execute approved proposal
