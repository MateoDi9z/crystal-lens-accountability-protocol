# CLAP Frontend (SvelteKit)

Este es el cliente frontend de **CLAP (Crystal Lens Accountability Protocol)** desarrollado con SvelteKit, TypeScript y TailwindCSS. Utiliza **Reown AppKit + wagmi + viem** para conectarse con la red de pruebas Sepolia.

---

## Configuración para Sepolia Testnet

1. Copia el archivo `.env.example` para crear tu `.env`:
   ```sh
   cp .env.example .env
   ```
2. Rellena las siguientes variables en `.env`:
   - `VITE_REOWN_PROJECT_ID`: Tu Project ID obtenido de [Reown Cloud](https://dashboard.reown.com).
   - `VITE_RPC_URL`: Endpoint RPC para Sepolia (por ejemplo, de Alchemy, QuickNode, Ankr, etc.).
   - `VITE_CHAIN_ID`: `11155111` (ID de Sepolia).
   - Variables de las organizaciones hardcodeadas (`SLUG`, `NAME`, `MEMBERSHIP`, `TREASURY`, `GOVERNANCE`).

---

## Sepolia Faucets (Fondos de prueba)

Para realizar transacciones de pago, creación de propuestas o votaciones, necesitas Sepolia ETH. Consíguelos gratis aquí:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [QuickNode Sepolia Faucet](https://faucet.quicknode.com/drip)
- [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

---

## Flujo de la Aplicación
1. **Conexión**: El usuario conecta su billetera (e.g. MetaMask) desde el botón en la barra de navegación.
2. **Navegación / Descubrir**: Explora la sección `/discover` para ver las organizaciones públicas activas.
3. **Página de la Org**: Entra a `/org/[slug]` para auditar el saldo del cofre (Treasury), miembros registrados, propuestas y su estado.
4. **Mi Dashboard (`/dashboard`)**:
   - **Flujo de Pago**: Si eres un miembro con una contribución pendiente, verás una tarjeta destacada indicando tu deuda y un botón simple para pagarla al instante.
   - **Gobernanza**: Si tu deuda es 0, podrás visualizar y votar a favor/en contra de las propuestas activas.
   - **Panel Owner**: Si eres el creador de la organización, verás un panel de administración para registrar nuevos contribuidores y crear nuevas propuestas.

---

## Creando y Recreando el Proyecto (sv CLI)

Para recrear este proyecto con la misma configuración inicial:

```sh
bun x sv@0.15.4 create --template minimal --types ts --add prettier tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:vercel" mcp="ide:gemini,opencode+setup:local" --install bun client
```


## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
