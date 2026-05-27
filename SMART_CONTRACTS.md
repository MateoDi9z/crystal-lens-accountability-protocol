# CLAP — Arquitectura Final de Smart Contracts

# 🌎 Contexto General

CLAP (Crystal Lens Accountability Protocol) es una plataforma de gobernanza descentralizada orientada a organizaciones y comunidades que administran fondos comunes.

La aplicación permitirá:

- registrar contribuyentes
- gestionar propuestas
- votar propuestas
- administrar fondos comunes
- exigir contribuciones pendientes para habilitar votación

La solución estará completamente on-chain:

- sin backend tradicional
- sin base de datos
- utilizando únicamente smart contracts y eventos

---

# 🏛️ Modelo Arquitectónico

La arquitectura final estará compuesta por 3 contratos separados:

```txt
Membership.sol
Governance.sol
Treasury.sol
```

Cada deploy representa UNA organización.

Es decir:

```txt
1 organización = 1 set de contratos
```

Ejemplo:

```txt
Municipalidad A
    -> Membership A
    -> Governance A
    -> Treasury A

Hospital B
    -> Membership B
    -> Governance B
    -> Treasury B
```

Esto elimina la complejidad multi-organización dentro del mismo deployment.

---

# 🎯 Objetivos del Diseño

La arquitectura busca:

- simplicidad
- modularidad
- claridad conceptual
- facilidad de testing
- facilidad de integración frontend
- minimizar complejidad innecesaria

---

# 📦 CONTRATO 1 — Membership.sol

# Responsabilidad

Gestionar:

- identidad de contribuyentes
- membresías
- permisos de participación

---

# 🪙 Modelo de Membership

El contrato utilizará ERC20 únicamente como mecanismo estándar y auditado de ownership/membership.

Cada contribuyente poseerá:

```txt
1 token ERC20
```

representando pertenencia a la organización.

---

# ⚠️ IMPORTANTE — Soulbound ERC20

El token será completamente NON-TRANSFERABLE.

No representa:

- dinero
- acciones
- ownership financiero

Representa únicamente:

```txt
pertenencia a la organización
```

---

# 🔒 Transferencias Bloqueadas

El contrato bloqueará:

- transfer
- transferFrom
- approve
- allowance

Esto evita:

- venta de membresías
- delegación de votos
- transferencia de identidad

---

# 👤 Gestión de Miembros

Solo el owner de la organización puede:

- agregar miembros
- remover miembros

---

# ➕ Alta de Miembro

Cuando se agrega un miembro:

1. se valida que no sea miembro ya
2. se mintea 1 token ERC20
3. se registra pendingContribution en Treasury

---

# ➖ Baja de Miembro

Cuando se elimina un miembro:

1. se quema el token ERC20
2. pierde derecho de voto
3. los votos históricos permanecen válidos

---

# 📌 Estado Esperado

Un usuario es miembro si:

```solidity
balanceOf(user) > 0
```

---

# 📡 Dependencias

Membership conoce:

```solidity
Treasury treasury;
```

para registrar pending contributions iniciales.

---

# 📦 CONTRATO 2 — Treasury.sol

# Responsabilidad

Gestionar:

- fondos de la organización
- pending contributions
- pagos de contribuyentes
- custodia de ETH

---

# 💰 Pending Contributions

Cada contribuyente tiene:

```solidity
mapping(address => uint256)
public pendingContribution;
```

Representa cuánto debe aportar antes de poder votar.

---

# 🧾 Regla Principal

Un contribuyente SOLO puede votar si:

```solidity
pendingContribution[user] == 0
```

---

# 💸 Pago de Contribuciones

El Treasury tendrá una función:

```solidity
payContribution()
```

que permitirá:

- enviar ETH
- pagar total o parcialmente
- reducir pendingContribution

---

# 📈 Pago Parcial

Ejemplo:

```txt
pending = 100

paga 40

nuevo pending = 60
```

---

# 🏦 Custodia de Fondos

Todo ETH recibido:

- queda almacenado en Treasury
- no sale automáticamente
- solo Governance puede liberar fondos

---

# 🔐 Permisos

Treasury tendrá:

```solidity
address public governance;
address public membership;
```

---

# 🛡️ Restricciones

Solo Membership puede:

```txt
crear pending contributions
```

Solo Governance puede:

```txt
liberar fondos
```

---

# 💸 Liberación de Fondos

Cuando Governance aprueba una proposal:

```txt
Governance -> Treasury.releaseFunds(...)
```

Treasury transfiere ETH al recipient indicado.

---

# 🔒 Seguridad

Treasury utilizará:

```solidity
ReentrancyGuard
```

especialmente en:

- payContribution
- releaseFunds

---

# 📦 CONTRATO 3 — Governance.sol

# Responsabilidad

Gestionar:

- propuestas
- votaciones
- aprobación de gastos
- liberación de fondos

---

# 📌 Modelo de Votación

Cada miembro:

- puede votar una sola vez
- tiene exactamente 1 voto
- debe tener pendingContribution == 0

---

# 🗳️ Proposals

Cada proposal tendrá:

```solidity
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
```

---

# 📌 Estados de Proposal

```solidity
enum ProposalStatus {
    Active,
    Approved,
    Rejected,
    Executed
}
```

---

# 📡 Storage Principal

```solidity
mapping(uint256 => Proposal)
public proposals;
```

---

# 🗳️ Registro de Votos

```solidity
mapping(uint256 => mapping(address => bool))
public hasVoted;
```

---

# 🧾 Reglas para Votar

Para votar:

1. debe ser miembro
2. no debe haber votado
3. proposal debe estar activa
4. voting period no debe haber terminado
5. pendingContribution debe ser 0

---

# 📌 Snapshotting

NO habrá snapshotting.

La regla será:

```txt
cualquier miembro actual puede votar
```

aunque haya ingresado luego de creada la proposal.

Esto reduce complejidad significativamente.

---

# 🏁 Finalización de Proposal

Cuando termina el voting period:

```solidity
finalizeProposal(...)
```

determina:

- Approved
- Rejected

---

# 💸 Ejecución

Si la proposal se aprueba:

```txt
Governance llama Treasury.releaseFunds(...)
```

automáticamente.

---

# 🔐 Dependencias

Governance conoce:

```solidity
Membership membership;
Treasury treasury;
```

---

# 🔄 Flujo Completo del Sistema

# 1. Deploy

Se deployean:

```txt
Membership
Treasury
Governance
```

para una organización.

---

# 2. Alta de miembro

Owner:

```txt
addMember(user)
```

Membership:

- mintea 1 token
- registra pendingContribution

---

# 3. Pago

Contributor:

```txt
payContribution()
```

Treasury:

- recibe ETH
- reduce pendingContribution

---

# 4. Proposal

Miembro crea proposal.

---

# 5. Voting

Miembros al día votan.

---

# 6. Finalización

Governance aprueba/rechaza.

---

# 7. Ejecución

Treasury libera fondos automáticamente.

---

# 🔒 Decisiones de Diseño

# ✅ ERC20 en lugar de mappings manuales

Se eligió ERC20 porque:

- estándar auditado
- ownership ya resuelto
- tooling compatible
- frontend más simple
- integración fácil con ethers.js

---

# ✅ No Transferible

Las memberships son soulbound.

---

# ✅ Un deployment por organización

Reduce enormemente:

- complejidad
- permisos
- relaciones
- storage
- frontend

---

# ✅ Sin snapshots

Reduce complejidad de governance.

---

# ✅ Governance simple

Cada miembro:

```txt
1 wallet = 1 voto
```

---

# 🚫 Features Fuera de Scope

No se implementará:

- quadratic voting
- delegated voting
- snapshots
- reputation systems
- NFTs
- multi-org deployments
- KYC real
- governance tokens transferibles
- backend off-chain

---

# 🧪 Testing Esperado

# Membership

- mint member
- burn member
- prevent transfers
- prevent approvals
- validate membership

---

# Treasury

- assign pending contribution
- partial payments
- full payments
- release funds
- access control
- reentrancy protection

---

# Governance

- create proposal
- vote
- prevent double vote
- reject non-members
- reject members with pendingContribution
- finalize proposal
- execute approved proposal

---

# 🚀 Resultado Final

Una DAO simple y modular donde:

- una organización administra contribuyentes
- los miembros realizan aportes
- solo miembros al día votan
- las propuestas controlan uso de fondos
- Treasury custodia el capital
- Governance decide liberación
- Membership controla identidad
- todo ocurre on-chain
