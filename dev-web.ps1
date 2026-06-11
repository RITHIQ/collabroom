# Run from repo root; if double-click is blocked, use dev-web.bat or:
#   powershell -ExecutionPolicy Bypass -File .\dev-web.ps1
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js was not found. Install LTS from https://nodejs.org and try again."
  exit 1
}

$webMods = Join-Path $PSScriptRoot "web/node_modules"
if (-not (Test-Path -LiteralPath $webMods)) {
  Write-Host "Installing web dependencies (first run)..."
  npm --prefix "web" install
}

Write-Host ""
Write-Host "Starting dev server — open http://localhost:3000"
Write-Host "Press Ctrl+C to stop."
Write-Host ""
npm --prefix "web" run dev
