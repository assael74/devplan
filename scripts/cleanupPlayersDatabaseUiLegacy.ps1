param(
  [string]$ProjectRoot = 'C:\projects\devplan'
)

$ErrorActionPreference = 'Stop'

$targets = @(
  'src\features\playersDatabase\ui\hooks\useSearchPage.js',
  'src\features\playersDatabase\ui\hooks\demoData.js',
  'src\features\playersDatabase\ui\pages\searchPage\results\search.columns.js'
)

$removed = @()
$missing = @()

foreach ($relativePath in $targets) {
  $fullPath = Join-Path $ProjectRoot $relativePath

  if (Test-Path -LiteralPath $fullPath) {
    Remove-Item -LiteralPath $fullPath -Force
    $removed += $relativePath
  }
  else {
    $missing += $relativePath
  }
}

Write-Host ''
Write-Host 'Players Database UI legacy cleanup completed.' -ForegroundColor Green

if ($removed.Count -gt 0) {
  Write-Host ''
  Write-Host 'Removed:' -ForegroundColor Cyan
  $removed | ForEach-Object { Write-Host "- $_" }
}

if ($missing.Count -gt 0) {
  Write-Host ''
  Write-Host 'Already missing:' -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "- $_" }
}

Write-Host ''
Write-Host 'Next command: npm run build' -ForegroundColor Cyan
