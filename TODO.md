# Contexto General del Proyecto

CLAP (Crystal Lens Accountability Protocol) es una plataforma de gobernanza descentralizada para organismos públicos y comunidades.

El objetivo es permitir que grupos/organizaciones administren fondos comunes de manera transparente mediante smart contracts en Ethereum.

La aplicación será completamente on-chain:

- no habrá backend tradicional
- no habrá base de datos
- todo el estado se leerá desde contratos y eventos

La arquitectura estará separada en 3 contratos principales:

```
Memberships.sol
Governance.sol
Treasury.sol
```

Cada contrato tendrá una responsabilidad clara y desacoplada.

---

# Modelo Conceptual

El sistema modela:

```
Organizations
     many-to-many
Contributors

Organizations
     one-to-many
Proposals

Proposals
     many-to-many
Votes
```

Además:

```
Organizations
     one-to-many
Contribution Requests / Debts
```

Un contributor puede:

- pertenecer a múltiples organizaciones
- votar propuestas de cada organización
- tener deudas pendientes distintas según la organización
- realizar pagos parciales

---

# Arquitectura General

# 1. Memberships.sol

El contrato utilizará el estándar ERC1155 para representar membresías.

Cada organización será representada mediante un tokenId distinto.

Las memberships serán NON-TRANSFERABLE (Soulbound), lo que significa que:

- no pueden transferirse entre wallets
- no pueden venderse
- no pueden delegarse

Esto garantiza que:

- los votos pertenezcan realmente a los miembros
- no exista compra/venta de membresías
- el sistema de governance mantenga integridad

Responsabilidad:

```
gestionar membresías
```

Este contrato define:

- qué usuarios pertenecen a qué organizaciones
- qué wallets son admins de organizaciones

Se implementará usando ERC1155 porque:

- representa naturalmente memberships
- soporta relación many-to-many
- es eficiente en gas
- evita arrays enormes y mappings complejos

Cada organización será representada mediante un `tokenId`.

Ejemplo:

```
tokenId 1 => Municipalidad A
tokenId 2 => Hospital B
tokenId 3 => Comunidad C
```

Si un usuario posee balance > 0 del tokenId:

```
es miembro de esa organización
```

### Soulbound Memberships

Aunque el sistema utiliza ERC1155, las memberships no serán transferibles.

El contrato bloqueará:

- transferencias
- safeTransferFrom
- transferencias entre usuarios

Solo estarán permitidos:

- mint (agregar miembro)
- burn (remover miembro)

Esto convierte las memberships en Soulbound Tokens.

Se eligió ERC1155 Soulbound en lugar de mappings manuales porque:

- resuelve naturalmente relaciones many-to-many
- reduce complejidad
- mejora interoperabilidad
- simplifica frontend
- mantiene compatibilidad con tooling estándar
- evita compra/venta de memberships

Las memberships NO representan activos financieros ni ownership económico.

Representan únicamente pertenencia y permisos dentro de una organización.

---

# 2. Governance.sol

Responsabilidad:

```
gestionar propuestas y votaciones
```

Este contrato:

- crea propuestas
- registra votos
- evita doble voto
- finaliza propuestas
- valida quórum
- realiza proof-of-execution

Todas las propuestas pertenecen a una organización.

Solo miembros de esa organización pueden votar.

---

# 3. Treasury.sol

Responsabilidad:

```
gestionar fondos y pagos
```

Este contrato:

- recibe fondos
- asigna deudas/contribution requests
- registra pagos
- libera fondos aprobados

---

# Relaciones Entre Contratos

```
Governance
    -> consulta Memberships

Treasury
    -> consulta Memberships

Governance
    -> llama Treasury
```

Memberships será el contrato central de permisos.

---

#  Decisiones Importantes

## No usar arrays para relaciones many-to-many

NO hacer:

```solidity
mapping(org => address[])
mapping(user => uint256[])
```

porque:

- enumerar arrays en solidity es caro
- remover elementos es feo
- genera bugs rápido

ERC1155 resuelve esto elegantemente.

---

#  CONTRACT 1  Memberships.sol

# Objetivo

Representar organizaciones y membresías.

---

# Paso 1  Crear contrato ERC1155

Herencia:

```solidity
ERC1155
Ownable
```

---

# Paso 2  Crear contador de organizaciones

Variable:

```solidity
uint256 public organizationCount;
```

---

# Paso 3  Crear metadata de organizaciones

Struct:

```solidity
struct Organization {
    uint256 id;
    string name;
    string description;
}
```

Mapping:

```solidity
mapping(uint256 => Organization) public organizations;
```

---

# Paso 4  Crear organización

Función:

```solidity
createOrganization(...)
```

Debe:

- incrementar contador
- guardar metadata
- asignar admin
- emitir evento

---

# Paso 5  Implementar memberships ERC1155

Las memberships serán Soulbound.

Implementar override de:

`_beforeTokenTransfer(...)`

para bloquear transferencias entre usuarios.

# Paso 5.5  Bloquear transferencias

Overridear:

_beforeTokenTransfer(...)

y permitir únicamente:

- mint
- burn

Cualquier transferencia wallet -> wallet debe revertir.

---

# Paso 6  Agregar miembros

Función:

```solidity
addMember(orgId, user)
```

Validaciones:

- solo admin de org
- user no miembro previamente

---

# Paso 7  Remover miembros

Función:

```solidity
removeMember(orgId, user)
```

Usar:

```solidity
_burn(user, orgId, 1);
```

---

# Paso 7.5 - Agregar y borrar admins

```solidity
mapping(uint256 => mapping(address => bool))
public organizationAdmins;
```

```solidity
// Cuando creas una org
organizationAdmins[orgId][msg.sender] = true;
```

El creador queda como primer admin.

# Paso 8  Helpers

Funciones:

```solidity
isMember(orgId, user)
isAdmin(orgId, user)
```

---

# Paso 9  Eventos

Crear:

```solidity
OrganizationCreated
MemberAdded
MemberRemoved
```

---

# Paso 10  Tests

Testear:

- crear organización
- agregar miembros
- remover miembros
- permisos
- balances ERC1155
- verificar que memberships NO sean transferibles
- verificar que safeTransferFrom revierte
- verificar que mint funciona
- verificar que burn funciona

---

#  CONTRACT 2  Governance.sol

# Objetivo

Gestionar propuestas y votaciones.

---

# Paso 1  Recibir address de Memberships

Constructor:

```solidity
constructor(address membershipsAddress)
```

Guardar:

```solidity
Memberships public memberships;
```

---

# Paso 2  Crear enum ProposalStatus

```solidity
enum ProposalStatus {
    Active,
    Approved,
    Rejected,
    ExecutionVoting,
    Executed
}
```

---

# Paso 3  Crear struct Proposal

Campos:

```solidity
id
organizationId
creator
title
description
amount
recipient
votesFor
votesAgainst
executionVotesFor
executionVotesAgainst
endBlock
executionEndBlock
status
```

---

# Paso 4  Crear storage

```solidity
mapping(uint256 => Proposal) public proposals;
```

y:

```solidity
uint256 public proposalCount;
```

---

# Paso 5  Crear proposal

Función:

```solidity
createProposal(...)
```

Validaciones:

- creator miembro
- creator admin de org (opcional)

Debe:

- guardar proposal
- setear status Active
- emitir evento

---

# Paso 6  Registrar votos

Mapping:

```solidity
mapping(uint256 => mapping(address => bool))
public hasVoted;
```

Función:

```solidity
vote(proposalId, support)
```

Validaciones:

- proposal activa
- miembro de org
- no votó antes
- voting no terminado

---

# Paso 7  Finalizar proposal

Función:

```solidity
finalizeProposal(proposalId)
```

Debe:

- verificar block.number
- comparar votos
- aprobar/rechazar

Si aprueba:

```
status = ExecutionVoting
```

NO liberar fondos todavía.

---

# Paso 8  Proof of Execution

Agregar:

```solidity
mapping(uint256 => mapping(address => bool))
public executionHasVoted;
```

Función:

```solidity
voteExecution(...)
```

Segunda votación:

```
la propuesta realmente se ejecutó?
```

---

# Paso 9  Finalizar ejecución

Función:

```solidity
finalizeExecution(...)
```

Si aprueba:

```
status = Executed
```

y llamar Treasury.

---

# Paso 10  Integrar Treasury

Guardar:

```solidity
Treasury public treasury;
```

Llamar:

```solidity
treasury.releaseFunds(...)
```

---

# Paso 11  Eventos

Crear:

```solidity
ProposalCreated
VoteCast
ProposalApproved
ProposalRejected
ExecutionVoteCast
ProposalExecuted
```

---

# Paso 12  Tests

Testear:

- crear proposal
- votar
- evitar doble voto
- finalizar
- proof of execution
- permisos
- quórum
- edge cases

---

#  CONTRACT 3  Treasury.sol

# Objetivo

Gestionar dinero y contribution requests.

---

# Paso 1  Recibir Memberships

Constructor:

```solidity
constructor(address membershipsAddress)
```

---

# Paso 2  Crear balances por organización

```solidity
mapping(uint256 => uint256)
public organizationBalances;
```

---

# Paso 3  Contribution Requests / Debts

Mapping:

```solidity
mapping(uint256 => mapping(address => uint256))
public pendingDebt;
```

Representa:

```
orgId -> contributor -> debt
```

---

# Paso 4  Registrar pagos totales

```solidity
mapping(uint256 => mapping(address => uint256))
public totalPaid;
```

---

# Paso 5  Asignar deuda

Función:

```solidity
assignDebt(orgId, contributor, amount)
```

Validaciones:

- caller admin de org
- contributor miembro

Debe:

```solidity
pendingDebt += amount;
```

---

# Paso 6  Pagar deuda

Función:

```solidity
payDebt(orgId)
```

Debe:

- aceptar ETH
- permitir pagos parciales
- reducir deuda
- aumentar balance org

---

# Paso 7  Depositar fondos libres

Función:

```solidity
deposit(orgId)
```

Para donaciones o aportes sin deuda.

---

# Paso 8  Liberar fondos

Función:

```solidity
releaseFunds(...)
```

Solo Governance puede llamar.

Debe:

- validar balances
- transferir ETH
- emitir evento

---

# Paso 9  Seguridad

Agregar:

```solidity
ReentrancyGuard
```

y usar:

```solidity
nonReentrant
```

---

# Paso 10  Eventos

Crear:

```solidity
DebtAssigned
DebtPaid
FundsDeposited
FundsReleased
```

---

# Paso 11  Tests

Testear:

- asignar deuda
- pagar parcial
- pagar completo
- liberar fondos
- permisos
- reentrancy
- balances

---

#  Orden Recomendado de Desarrollo

# Fase 1

```
Memberships.sol
```

Primero resolver identidad y permisos.

---

# Fase 2

```
Governance.sol
```

Sin treasury todavía.

Primero:

- proposals
- voting
- execution voting

---

# Fase 3

```
Treasury.sol
```

Agregar:

- balances
- deudas
- pagos

---

# Fase 4

Integrar:

```
Governance -> Treasury
```

---

# Fase 5

Frontend.

---

#  Recomendaciones Importantes

# 1. Mantener contratos pequeños

No meter toda la lógica en un solo contrato.

---

# 2. Emitir MUCHOS eventos

Porque no tendrán backend.

El frontend dependerá de logs.

---

# 3. Priorizar claridad

Es un TP.

Mejor simple y limpio que ultra complejo.

---

# 4. Hacer tests desde el día 1

En smart contracts:

```
si no está testeado, está roto
```

---

# 5. No optimizar gas demasiado temprano

Primero:

```
que funcione
```

Después optimizan.

---

#  Resultado Final Esperado

Una DAO multi-organización donde:

- organizaciones tienen miembros
- miembros votan propuestas
- organizaciones gestionan fondos
- contributors realizan aportes
- governance aprueba gastos
- la comunidad valida ejecución
- todo ocurre on-chain

