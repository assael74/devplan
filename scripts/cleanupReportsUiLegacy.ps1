# scripts/cleanupReportsUiLegacy.ps1

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$canonicalPaths = @(
  'src/features/reports/renderers/teamPlayers/ReportRoot.js',
  'src/features/reports/renderers/management/ReportRoot.js',
  'src/features/reports/renderers/playerTargets/PlayerTargetsPrintView.js',
  'src/features/reports/renderers/external/ReportRenderer.js'
)

foreach ($relativePath in $canonicalPaths) {
  $fullPath = Join-Path $projectRoot $relativePath
  if (-not (Test-Path $fullPath)) {
    throw "Canonical report file is missing: $relativePath"
  }
}

$legacyDirectories = @(
  'src/features/hub/teamProfile/sharedUi/players/print',
  'src/features/hub/teamProfile/sharedUi/management/print',
  'src/features/hub/playerProfile/sharedUi/info/print',
  'src/features/reports/external/render'
)

foreach ($relativePath in $legacyDirectories) {
  $fullPath = Join-Path $projectRoot $relativePath
  if (Test-Path $fullPath) {
    Remove-Item $fullPath -Recurse -Force
    Write-Host "Removed: $relativePath"
  } else {
    Write-Host "Skipped (not found): $relativePath"
  }
}

Write-Host 'Legacy report UI cleanup completed.'
