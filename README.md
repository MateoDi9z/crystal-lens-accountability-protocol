# 📋 CLAP — Crystal Lens Accountability Protocol

> Plataforma de gobernanza descentralizada para organismos públicos y comunidades, donde los contribuyentes pueden auditar, votar y aprobar el uso de fondos comunes sin fricción técnica.

---

# ✨ Objetivo

CLAP busca transparentar el uso de fondos comunes mediante una dApp completamente on-chain, permitiendo:

- Aportes a una tesorería común.
- Creación de propuestas de gasto.
- Votaciones descentralizadas.
- Liberación de fondos únicamente tras validación comunitaria.
- Acceso simplificado mediante Account Abstraction.

El proyecto se desarrolla como trabajo práctico académico para la materia de Blockchain / Smart Contracts.

---

# 🏗️ Arquitectura General

El proyecto está organizado como un **monorepo** dividido en dos aplicaciones principales:

```txt
clap/
├── client/       # Frontend (SvelteKit o Nuxt)
├── contracts/    # Smart Contracts (Foundry)
└── README.md
```

---

# ⛓️ Smart Contracts

Ubicación:

```txt
/contracts
```

Tecnologías:

- Solidity
- Foundry
- OpenZeppelin
- Sepolia Testnet

## Contratos principales:

Si more in [SMART_CONTRACTS](./SMART_CONTRACTS.md)

# 👥 Modelo de Roles

## 🏛️ Organismos

Los organismos representan entidades autorizadas a:

- Crear propuestas.
- Solicitar uso de fondos.

### ¿Cómo se crea un organismo?

En esta primera versión:

- El owner/admin del contrato registra wallets autorizadas.
- Las wallets registradas obtienen el rol `ORGANIZATION_ROLE`.

Esto evita complejidad innecesaria de identidad/KYC y mantiene el scope académico controlado.

---

## 🧑‍💼 Contribuyentes

Los contribuyentes son usuarios que:

- Aportan fondos al treasury.
- Obtienen derecho a votar.

### ¿Cómo se convierte alguien en contribuyente?

Un usuario pasa a ser contribuyente cuando:

1. Se registra mediante Abstract Login.
2. Realiza al menos un aporte al Treasury.

El contrato puede:

- Marcar automáticamente la wallet como contribuyente.
- Guardar:
  - monto total aportado
  - cantidad de aportes
  - estado de elegibilidad para votar

# 🔐 Seguridad y Decisiones Técnicas

## Principios

- Minimizar lógica compleja.
- Mantener todo el estado on-chain.
- Evitar dependencias centralizadas.
- Priorizar transparencia.

---

## Seguridad esperada

- Uso de OpenZeppelin.
- AccessControl para roles.
- ReentrancyGuard.
- Validaciones de quorum.
- Validaciones de doble voto.
- Tests unitarios en Foundry.

---

# 💻 Frontend

Ubicación:

```txt
/client
```

Tecnologías:

- SvelteKit o Nuxt.js
- Ethers.js
- TailwindCSS
- ReOwn / Abstract Login

---

## Funcionalidades

- Login social/email.
- Dashboard de treasury.
- Creación de propuestas.
- Votación.
- Historial on-chain.
- Estado de propuestas.
- Visualización de fondos.

---

# 🌐 Infraestructura

## Smart Contracts

- Red: Sepolia
- Verificación en Etherscan

---

## Frontend

- Deploy en Vercel

---

# 🚫 Out of Scope

No se desarrollará:

- Backend tradicional.
- Base de datos off-chain.
- Integración fiat.
- Delegación de votos.
- KYC real.
- Sistema legal de identidad.

---

# 📅 Roadmap

## ✅ Pitch de Idea — 14 Mayo

- Problema
- Solución
- Arquitectura
- Impacto

---

## ⏳ On-chain v1 — 28 Mayo

Entrega esperada:

- Treasury.sol
- Governance.sol
- Tests básicos
- Deploy local

---

## 🏁 Demo Final — 18 Junio

Presentación completa:

- Frontend funcional
- Smart contracts en Sepolia
- Flujo end-to-end funcionando

---

# 🧪 Desarrollo Local

## Requisitos

- Node.js
- Foundry
- pnpm/npm
- evm wallet

---

# ⚒️ Contracts

```bash
cd contracts
forge install
forge build
forge test
```

## Deploy local

```bash
anvil
```

En otra terminal:

```bash
forge script script/Deploy.s.sol --broadcast
```

---

# 💻 Client

```bash
cd client
npm install
npm run dev
```

---

# 📦 Posible Estructura Interna

```txt
contracts/
├── src/
│   ├── Treasury.sol
│   ├── Governance.sol

│   └── interfaces/
├── script/
├── test/
└── lib/

client/
├── src/
│   ├── routes/
│   ├── lib/
│   ├── components/
│   ├── stores/
│   └── contracts/
```

---

# 🧠 Decisiones de Diseño

## ¿Por qué Foundry?

- Tests rápidos.
- Tooling moderno.
- Excelente DX.
- Scripts de deploy simples.

---

## ¿Por qué Account Abstraction?

Porque elimina una enorme barrera de entrada:

- usuarios sin crypto
- usuarios sin gas
- login social/email

Esto mejora muchísimo la adopción y UX.

---

# 📚 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | SvelteKit / Nuxt |
| Smart Contracts | Solidity |
| Framework Contracts | Foundry |
| Blockchain | Ethereum Sepolia |
| Web3 Client | Ethers.js |
| Auth | ReOwn / Abstract Login |
| Styling | TailwindCSS |
| Deploy Front | Vercel |

---

# 👨‍💻 Integrantes

- Bautista D'Hipolito
- Mateo Diaz
