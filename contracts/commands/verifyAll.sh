#!/bin/bash

echo "🔍 Verificando contratos en Etherscan Sepolia..."

# Cargar variables de entorno
SCRIPT_DIR="$(dirname "$0")"
set -a
source "$SCRIPT_DIR/../.env.local"
set +a

# Verificar que exista la API Key
if [ -z "$ETHERSCAN_API_KEY" ]; then
  echo "❌ Error: No se encontró ETHERSCAN_API_KEY en .env.local"
  exit 1
fi

# Función para verificar un contrato
verify() {
  local contract_name=$1
  local address=$2

  echo "→ Verificando $contract_name ($address)..."

  forge verify-contract \
    "$address" \
    "$contract_name" \
    --chain sepolia \
    --verifier etherscan \
    --etherscan-api-key "$ETHERSCAN_API_KEY" || echo "⚠️  Falló la verificación de $contract_name"

  echo "--------------------------------------------------"
}

# === Organización 1 ===
echo "=== Organización 1 ==="
verify "Membership"  "0x54375f1dfA4cC16956136e67b8fb2Df7c8fFfA90"
verify "Treasury"    "0xef6594d9c949043FCDA4686C84Aa76bBe08d8594"
verify "Governance"  "0x026Bd684b9a3668A056bd5B90acbCd1240c87E25"

# === Organización 2 ===
echo "=== Organización 2 ==="
verify "Membership"  "0xD895C295155941618A62f631Ee43355856fCc340"
verify "Treasury"    "0x07763b6CD25675F4AAfCee0271d4fdAFA65b202d"
verify "Governance"  "0x592B2c5cEDAa5894648851248537299Ec11f619d"

# === Organización 3 ===
echo "=== Organización 3 ==="
verify "Membership"  "0x58E707daD90Dda0290B6Ba89c2269d15c62Cd2Bb"
verify "Treasury"    "0x4E4658AF8BA51984C553344D32F466333652Bd1B"
verify "Governance"  "0x52F328CCaF3d67452fB6d6e02132F579A12955ee"

echo "✅ Verificación masiva finalizada!"