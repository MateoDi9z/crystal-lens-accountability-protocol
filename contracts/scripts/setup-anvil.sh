#!/usr/bin/env bash
set -euo pipefail

OWNER="0x26583527B405434313EC0A88F629Fb99B42E1e6D"
RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"

echo "Funding and impersonating owner ${OWNER}..."
cast rpc anvil_impersonateAccount "${OWNER}" --rpc-url "${RPC_URL}"
cast rpc anvil_setBalance "${OWNER}" 0x56BC75E2D63100000 --rpc-url "${RPC_URL}"

echo "Deploying contracts..."
forge script script/Deploy.s.sol \
  --broadcast \
  --rpc-url "${RPC_URL}" \
  --unlocked \
  --sender "${OWNER}"

echo "Done. Update client/src/lib/contracts/deployed.json with logged addresses."