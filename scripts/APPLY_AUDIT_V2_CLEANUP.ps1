param(
  [string]$ProjectRoot = 'C:\projects\devplan'
)

$legacyPaths = @(
  'src\features\playersDatabase\services\audit\v2',
  'src\features\playersDatabase\services\audit\playerScout.audit.js',
  'src\features\playersDatabase\services\audit\playerScoutRules.audit.js',
  'src\features\playersDatabase\services\audit\playerScoutDataHealth.audit.js',
  'src\features\playersDatabase\services\audit\playerScoutCombinedReconciliation.audit.js',
  'src\features\playersDatabase\services\audit\playerScoutGlobalRepair.apply.js',
  'src\features\playersDatabase\services\audit\playerScoutGlobalRepair.preview.js',
  'src\features\playersDatabase\services\audit\playerScout.repair.js',
  'src\features\playersDatabase\services\audit\playerScoutRepair.migrationPlan.js',
  'src\features\playersDatabase\services\audit\playerScoutRepair.selection.js',
  'src\features\playersDatabase\services\audit\playerScoutRepair.verification.js',
  'src\features\playersDatabase\services\audit\playerScoutSafeClassClosurePlan.js',
  'src\features\playersDatabase\services\audit\teamPlayerSchemaRepair.model.js',
  'src\features\playersDatabase\services\audit\playerIdentity.audit.js',
  'src\features\playersDatabase\services\audit\playerScoutDocumentRewrite.audit.js',
  'src\features\playersDatabase\services\audit\playerScoutShadow.audit.js',
  'src\features\playersDatabase\services\audit\playerDocumentCleanup.migration.js',
  'src\features\playersDatabase\services\audit\invalidTransferPlayerCleanup.migration.js',
  'src\features\playersDatabase\services\audit\orphanPlayerDocumentCleanup.migration.js',
  'src\features\playersDatabase\services\audit\playerScout.cost.js',
  'src\features\playersDatabase\services\audit\playerScoutAudit.contract.js',
  'src\features\playersDatabase\services\audit\playerScoutAudit.readPlan.js',
  'src\features\playersDatabase\services\audit\playerDocumentMigration.policy.js',
  'src\features\playersDatabase\services\audit\playerScoutSearchIndex.directRepair.js',
  'src\features\playersDatabase\ui\components\modals\PlayerScoutAuditModal.js'
)

foreach ($relativePath in $legacyPaths) {
  $fullPath = Join-Path $ProjectRoot $relativePath
  if (Test-Path $fullPath) {
    Remove-Item $fullPath -Recurse -Force
    Write-Host "Removed: $relativePath"
  }
}

Write-Host 'Audit V2 legacy cleanup completed.'
