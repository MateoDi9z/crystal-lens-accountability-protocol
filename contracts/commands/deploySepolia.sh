#!/bin/bash

# ========================
# Deploy Script - Sepolia
# ========================

echo "🚀 Iniciando deploy en Sepolia..."

# Ruta absoluta al .env
set -a
source "$(dirname "$0")/../.env.local"
set +a

echo "🔑 Usando private key: $DEPLOY_PRIVATE_KEY"

# Verificar que las variables importantes existan
if [ -z "$RPC_URL" ] || [ -z "$DEPLOY_ORG_OWNER" ] || [ -z "$DEPLOY_PRIVATE_KEY" ]; then
  echo "❌ Error: Asegúrate de tener RPC_URL, DEPLOY_ORG_OWNER y DEPLOY_PRIVATE_KEY en tu .env.local"
  exit 1
fi

forge script DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  -vvvv \
  --verify \
  --private-key $DEPLOY_PRIVATE_KEY

echo "✅ Deploy finalizado!"