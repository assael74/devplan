$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$files = @(
  'src\features\playersDatabase\ui\pages\searchPage\admin\SearchIndexNormalizationModal.js',
  'src\features\playersDatabase\ui\pages\searchPage\sx\searchNormalizationAdmin.sx.js'
)

foreach ($relativePath in $files) {
  $fullPath = Join-Path $projectRoot $relativePath

  if (Test-Path $fullPath) {
    Remove-Item $fullPath -Force
    Write-Host "Deleted: $relativePath"
  }
}

$adminFolder = Join-Path $projectRoot 'src\features\playersDatabase\ui\pages\searchPage\admin'

if (
  (Test-Path $adminFolder) -and
  -not (Get-ChildItem $adminFolder -Force | Select-Object -First 1)
) {
  Remove-Item $adminFolder -Force
}
