$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$targets = @(
  'src/ui/forms/create/createActions.js',
  'src/ui/domains/entityLifecycle/delete/deleteActions.js'
)

foreach ($relativePath in $targets) {
  $fullPath = Join-Path $projectRoot $relativePath

  if (Test-Path $fullPath) {
    Remove-Item -Force $fullPath
    Write-Host "Removed $relativePath"
  } else {
    Write-Host "Already absent $relativePath"
  }
}

Write-Host 'Tikunim 3 cleanup completed.'
