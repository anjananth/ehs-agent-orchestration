# Imports the Care Continuity tools + agent into the ACTIVE orchestrate environment.
# Run `orchestrate env list` first to confirm which env is active (see README.md).
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$orc = Join-Path $PSScriptRoot '.venv\Scripts\orchestrate.exe'

Write-Host "== Active environment ==" -ForegroundColor Cyan
& $orc env list

Write-Host "`n== Importing Python tools ==" -ForegroundColor Cyan
& $orc tools import -k python `
  -f tools/ehs_tools/care_continuity_tools.py `
  -r tools/ehs_tools/requirements.txt

Write-Host "`n== Importing agent ==" -ForegroundColor Cyan
& $orc agents import -f agents/care_continuity_agent.yaml

Write-Host "`n== Done. Verify with: ==" -ForegroundColor Green
Write-Host "  .\.venv\Scripts\orchestrate.exe tools list"
Write-Host "  .\.venv\Scripts\orchestrate.exe agents list"
