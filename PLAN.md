# PLAN — Crystal Lens Accountability Protocol (Frontend)

**Objetivo final**: Una app frontend (Svelte + Bun) ultra simple que permite a cualquier persona (sin conocimiento de blockchain):

- Ver organizaciones públicas.
- Ver y **pagar sus contribuciones pendientes** con la menor fricción posible.
- (Si ya pagó) votar propuestas.
- Los dueños de organización pueden agregar contribuidores y crear propuestas.

Todo usa los smart contracts como infraestructura (Sepolia). La experiencia debe sentirse como una web normal.

**Decisión clave (confirmada)**:
- Usar **Reown AppKit + wagmi + viem** (no Privy en esta versión).
- Sin sponsorship de gas.
- 1-3 organizaciones hardcodeadas (config).
- Sepolia.
- Páginas separadas.
- UX extremadamente simple: pagar debe ser obvio en 5 segundos para una persona normal.

---

## Estructura de páginas (aprobada)

- `/` → Landing (ya hecha)
- `/discover` → Lista simple de organizaciones públicas
- `/org/[slug]` → Vista pública completa de una organización (tesorería, miembros, TODAS las propuestas incluyendo ejecutadas)
- `/dashboard` → Área personal:
  - Sección principal: **Mis contribuciones pendientes** (el flujo #1, más prominente)
  - Sección de gobernanza: propuestas para votar (solo si deuda == 0)
  - Si sos owner: sección para agregar contribuidores + crear propuestas

---

## Fases y tareas paso a paso (orden recomendado)

### Fase 0 — Preparación y documentación
1. Crear `client/.env.example` con:
   - VITE_REOWN_PROJECT_ID
   - VITE_CHAIN_ID=11155111
   - VITE_RPC_URL (Sepolia)
   - Variables para 1-3 orgs (SLUG, NAME, MEMBERSHIP, TREASURY, GOVERNANCE)
2. Actualizar READMEs (raíz y client) con:
   - Instrucciones de Sepolia
   - Cómo obtener Sepolia ETH (lista de faucets)
   - Flujo nuevo de la app
3. Documentar este PLAN.md (este archivo).

### Fase 1 — Contratos en Sepolia
1. Crear o adaptar script de deploy para Sepolia (`script/DeploySepolia.s.sol` o mejorar el actual).
   - Usar variables de entorno o parámetros para owner, nombres, etc.
   - Deployar Membership → Treasury → Governance
   - Configurar las direcciones entre contratos
   - Crear 2-3 miembros de prueba con contribuciones pendientes
   - Crear al menos 1 propuesta
2. Deployar en Sepolia usando:
   ```bash
   forge script script/DeploySepolia.s.sol --rpc-url $SEPOLIA_RPC --private-key $PRIVATE_KEY --broadcast --verify
   ```
3. Guardar las direcciones finales de cada organización + nombre amigable.
4. Correr `forge test` para confirmar que todo sigue funcionando.
5. (Opcional) Hacer que el script acepte parámetros desde env.

**Entregable**: Contratos funcionando en Sepolia + direcciones + miembros de prueba.

### Fase 2 — Capa de Web3 (core de la app)
Crear en `client/src/lib/`:

1. `config/orgs.ts`
   - Lista hardcodeada de 1-3 organizaciones (slug, name, description, addresses).
   - Helpers: `getAllOrgs()`, `getOrg(slug)`.

2. `web3/client.ts`
   - Crear `publicClient` (viem) para Sepolia.
   - Helpers para walletClient cuando esté conectado.

3. `web3/appkit.ts`
   - Configurar Reown AppKit solo para Sepolia.
   - Soporte injected + WalletConnect.

4. `contracts/abi.ts`
   - ABIs mínimas de Membership, Treasury y Governance (solo las funciones que usamos).

5. `contracts/types.ts`
   - Tipos TypeScript: Org, TreasuryOverview, Member, UserStatus, Proposal, etc.

6. `contracts/read.ts`
   - Funciones puras de lectura:
     - `getTreasuryOverview(org)`
     - `getUserStatus(org, address)`
     - `getMembers(org)` (usando eventos MemberAdded + getMemberData)
     - `getProposals(org)` (incluyendo estado ejecutado)
     - `isOwner(org, address)`
   - Usar `getLogs` para listas (miembros y propuestas).
   - Multicall cuando sea posible.

7. `contracts/write.ts`
   - Funciones de escritura:
     - `payPendingContribution(org, amount)` — el más importante, debe mandar `value` exacto.
     - `registerContributor(org, to, dni, fullName, amount)`
     - `requestAdditionalDebt(org, contributor, amount)`
     - `createProposal(org, description, amount)`
     - `voteOnProposal(org, id, support)`

8. Stores (runes o archivos .svelte.ts):
   - Wallet / conexión (address actual, chain).
   - Estado de acciones (`runAction`, loading por clave).
   - Datos derivados (mis orgs, si soy owner, si puedo votar).

**Verificación**: Poder leer datos reales de Sepolia y ejecutar una transacción simple de pago.

### Fase 3 — Páginas públicas (sin wallet)
1. Crear rutas:
   - `routes/discover/+page.svelte`
   - `routes/org/[slug]/+page.svelte`
2. Mostrar:
   - Lista simple de orgs en discover.
   - En la página de org: TreasuryCard, MembersList (con nombre y estado), ProposalsList **completa** (incluyendo ejecutadas con monto liberado).
3. Todo debe funcionar sin estar conectado (solo publicClient).
4. Actualizar header para tener link a "Discover".

**Verificación**: Entrar a las páginas públicas sin conectar billetera y ver toda la información clara.

### Fase 4 — Dashboard y flujo de pago (máxima prioridad)
1. Crear `routes/dashboard/+page.svelte`
2. Estructura clara:
   - Sección superior (la más grande y obvia): "Tus contribuciones pendientes"
     - Por cada org a la que perteneces: "Debes X ETH a NombreDeOrg"
     - Botón gigante y claro: "Pagar X ETH ahora"
   - Debajo: Sección "Gobernanza" con propuestas en las que podés votar (solo si deuda === 0)
     - Si tenés deuda pendiente: mensaje claro "Pagá tus contribuciones para poder votar"
3. Implementar el flujo de pago con feedback excelente:
   - Estados: "Confirmar en tu billetera" → "Procesando" → Éxito ("¡Listo! Tu contribución fue registrada. Ahora estás al día.")
   - Mensajes en lenguaje humano (sin jerga blockchain).
   - Actualizar UI después del éxito.
4. Integrar componentes existentes (user-status, connect-prompt) pero simplificados.
5. Manejo amigable de errores: red equivocada, fondos insuficientes, etc.

**Verificación crítica**:
Una persona sin conocimiento de crypto debe poder:
- Conectarse
- Ver que debe plata
- Pagar con un clic
- Entender que ya está al día
En menos de 30 segundos y sin confusión.

### Fase 5 — Flujos de dueño + votación + propuestas
1. Detectar si la dirección conectada es owner de alguna org.
2. En dashboard (o sección dedicada) mostrar panel de administración:
   - Registrar nuevo contribuidor (address + DNI + nombre completo + monto inicial)
   - Asignar deuda adicional
   - Crear propuesta (descripción + monto)
3. Implementar votación:
   - Solo habilitada para usuarios con `pendingContribution == 0`
   - Botones "Votar a favor" / "Votar en contra"
   - Actualizar conteos después de votar
4. Asegurar que las propuestas ejecutadas se muestren correctamente con los datos de liberación de fondos.

**Verificación**:
- Dueño agrega contribuidor → aparece en la lista pública y puede pagar.
- Dueño crea propuesta → se ve como Pending.
- Contribuidores elegibles votan → se resuelve según el threshold del contrato.
- Se ejecuta la propuesta → aparece como Executed con los datos correspondientes.

### Fase 6 — Pulido de UX y simplicidad extrema
1. Feedback de acciones impecable en todo (no solo pagos).
2. Copia en español claro y corto en todos lados.
3. Advertencias de red y balance muy visibles y útiles (con links a faucets).
4. Responsive (mobile primero para el flujo de pago).
5. Quitar toda referencia a Anvil / localhost / deploys viejos.
6. Pequeña sección "Cómo funciona" (colapsable, 3-4 líneas máximo) en dashboard y páginas de org.
7. Estados de carga consistentes.
8. Mensajes de éxito que celebren la acción real ("Tu contribución ya está registrada").

### Fase 7 — Configuración, documentación y preparación final
1. Completar `.env` con las direcciones reales de Sepolia.
2. Actualizar READMEs con pasos exactos para correr en Sepolia.
3. Agregar `SEPOLIA_ADDRESSES.md` (o similar) con las direcciones usadas en la demo.
4. Correr `bun run check`, `bun run lint`, `bun run build`.

### Fase 8 — Pruebas manuales y demo
1. Caminos felices:
   - Usuario público navega todo.
   - Contribuyente paga.
   - Contribuyente (sin deuda) vota.
   - Owner agrega persona + crea propuesta.
2. Casos borde: sin fondos, red equivocada, deuda cero, propuesta ya ejecutada.
3. Probar en mobile.
4. Grabar o preparar las direcciones de prueba para la demo final.

---

## Notas importantes de implementación

- **Prioridad UX**: El flujo de pago es sagrado. Todo lo demás es secundario.
- Los componentes ya existentes (`owner-panel.svelte`, `proposals-list.svelte`, etc.) se van a reutilizar y adaptar, no tirar.
- Toda lectura de listas de miembros y propuestas se hace con eventos (`getLogs`) + lecturas posteriores.
- El chequeo "puede votar" se hace en frontend: `pendingContribution[address] === 0`.
- Mensajes y estados siempre en lenguaje de usuario final, nunca "llamando al contrato X".

---

## Criterios de éxito

- Cualquier persona puede pagar su contribución sin entender qué es una blockchain.
- Todas las páginas públicas muestran información completa y legible.
- Gobernanza funciona: creación, votación (solo sin deuda), ejecución y visualización de propuestas ejecutadas.
- La app se siente simple, moderna y confiable.
- Todo funciona en Sepolia real.

---

**Este es el PLAN oficial paso a paso.**  
Ejecutar en orden de fases. No saltear la Fase 4 (pago) ni la obsesión por simplicidad.