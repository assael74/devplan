# scripts/applyTikunim2Cleanup.ps1
# Run from the project root after copying the src files from devplan_tikunim_2.zip.

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot

$paths = @(
  'src/app/AuthProvider.js',
  'src/features/reports/legacy/hubReports.bridge.js',
  'src/features/reports/legacy/hubReportModels.bridge.js',
  'src/features/reports/legacy/hubReportRenderers.bridge.js',
  'src/shared/entityLifecycle/cascade/team/archiveTeamCascadePayments.js',
  'src/shared/entityLifecycle/cascade/team/deleteTeamCascadeShorts.js',
  'src/shared/entityLifecycle/cascade/team/deleteTeamCascadeStats.js',
  'src/shared/entityLifecycle/cascade/team/deleteTeamCascadeStorage.js',
  'src/shared/entityLifecycle/cascade/team/executeTeamCascadeDelete.js'
)

foreach ($relativePath in $paths) {
  $fullPath = Join-Path $projectRoot $relativePath
  if (Test-Path $fullPath) {
    Remove-Item $fullPath -Force
    Write-Host "Removed $relativePath"
  }
}

Write-Host 'Tikunim 2 cleanup completed.'
