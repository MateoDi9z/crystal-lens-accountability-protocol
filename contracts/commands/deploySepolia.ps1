# ========================
# Deploy Sepolia Script para PowerShell
# ========================

param (
    [string]$PrivateKey,
    [string]$TargetOwner = "0xB36E0A34B6921eB5c9B87e4AC963C557E8e6741b",
    [string]$RpcUrl = "https://rpc.ankr.com/eth_sepolia/deb47ce65affded1cbab3f99751ac28100ca1cd88b40951ac8631037f02ca441"
)

if ([string]::IsNullOrWhiteSpace($PrivateKey)) {
    Write-Host "❌ Error: Debes proporcionar tu Private Key de Sepolia." -ForegroundColor Red
    Write-Host "Uso: .\commands\deploySepolia.ps1 -PrivateKey 0xTUMATRIZKEY -TargetOwner 0xTUWALLET" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Iniciando despliegue de contratos en Sepolia Testnet..." -ForegroundColor Cyan
Write-Host "Target Owner: $TargetOwner" -ForegroundColor Yellow

$env:DEPLOY_ORG_OWNER = $TargetOwner

forge script script/DeploySingleOrg.s.sol:DeploySingleOrgScript `
  --rpc-url $RpcUrl `
  --broadcast `
  --verify `
  -vvv `
  --private-key $PrivateKey

Write-Host "✅ Despliegue en Sepolia completado!" -ForegroundColor Green
