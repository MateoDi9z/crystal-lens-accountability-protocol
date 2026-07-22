#!/bin/bash

# ========================
# Deploy Local Script - Anvil (1 Org)
# ========================

echo "🚀 Iniciando deploy local en Anvil (http://127.0.0.1:8545)..."

ANVIL_RPC="http://127.0.0.1:8545"
# Clave privada #0 por defecto de Anvil para pagar la transacción en el nodo local
ANVIL_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
# Tu wallet de MetaMask o Cuenta #0 de Anvil como Owner
OWNER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

DEPLOY_ORG_OWNER=$OWNER_ADDRESS forge script script/DeploySingleOrg.s.sol:DeploySingleOrgScript \
  --rpc-url $ANVIL_RPC \
  --broadcast \
  -vvv \
  --private-key $ANVIL_PRIVATE_KEY

echo "✅ Deploy local finalizado exitosamente!"
