# ========================
# Deploy Local Script - Anvil (1 Org) para PowerShell
# ========================

Write-Host "🚀 Iniciando deploy local en Anvil (http://127.0.0.1:8545)..." -ForegroundColor Cyan

$env:DEPLOY_ORG_OWNER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
$ANVIL_RPC = "http://127.0.0.1:8545"
$ANVIL_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

forge script script/DeploySingleOrg.s.sol:DeploySingleOrgScript `
  --rpc-url $ANVIL_RPC `
  --broadcast `
  -vvv `
  --private-key $ANVIL_PRIVATE_KEY

Write-Host "✅ Deploy local finalizado exitosamente!" -ForegroundColor Green
