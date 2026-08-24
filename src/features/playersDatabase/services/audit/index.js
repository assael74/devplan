// src/features/playersDatabase/services/audit/index.js

export {
  buildPlayerIdentityAudit,
  downloadPlayerIdentityAudit,
} from './playerIdentity.audit.js'

export {
  buildPlayerScoutAudit,
  downloadPlayerScoutAudit,
} from './playerScout.audit.js'

export {
  applyPlayerScoutEngineRefresh,
  applyPlayerScoutRepair,
  buildPlayerScoutEngineRefreshPreview,
  buildPlayerScoutRepairPreview,
} from './playerScout.repair.js'

export {
  buildPlayerScoutRulesAudit,
  buildScopedPlayerScoutRulesAudit,
  downloadPlayerScoutRulesAudit,
} from './playerScoutRules.audit.js'

export {
  buildPlayerScoutGlobalRepairPreview,
} from './playerScoutGlobalRepair.preview.js'

export {
  applyPlayerScoutGlobalDirectSearchIndexRepair,
  applyPlayerScoutGlobalRepair,
  applyPlayerScoutGlobalRegularRepair,
  applyPlayerScoutGlobalSafeDependencyOverlapRepair,
  buildPlayerScoutSafeDependencyWriteBudgetPlan,
  applyPlayerScoutGlobalSelectedOverlapRepair,
  applyPlayerScoutGlobalSelectedSafeRepair,
  buildGlobalActualDocumentWritePreview,
  buildMergedPlayerDocumentData,
  buildPlayerScoutGlobalApplyPreview,
  resolveGlobalRepairRowsForTarget,
} from './playerScoutGlobalRepair.apply.js'


export {
  buildPlayerScoutShadowComparison,
} from './playerScoutShadow.audit.js'


export {
  PLAYER_DOCUMENT_DEPRECATED_FIELDS,
  PLAYER_DOCUMENT_MIGRATION_ACTIONS,
  PLAYER_DOCUMENT_SCHEMA_SCOPES,
  classifyUnexpectedSchemaFields,
  resolveDeprecatedSchemaFields,
  resolveSchemaMigrationAction,
} from './playerDocumentMigration.policy.js'

export {
  applyPlayerScoutDocumentRewrite,
  buildPlayerScoutDocumentRewritePlan,
  buildPlayerScoutDocumentRewritePreview,
} from './playerScoutDocumentRewrite.audit.js'


export {
  PLAYER_SCOUT_AUDIT_CHECKS,
  PLAYER_SCOUT_AUDIT_CHECK_STATUS,
  PLAYER_SCOUT_AUDIT_CONTRACT_VERSION,
  PLAYER_SCOUT_AUDIT_PROCESS,
  PLAYER_SCOUT_ISSUE_KIND,
  PLAYER_SCOUT_REPAIR_TYPE,
  buildPlayerScoutAuditContractResult,
  buildPlayerScoutAuditCoverage,
  normalizePlayerScoutAuditIssue,
} from './playerScoutAudit.contract.js'


export {
  PLAYER_SCOUT_AUDIT_READ_BUDGETS,
  PLAYER_SCOUT_AUDIT_READ_PLAN_MODE,
  assertTeamSeasonScoutAuditReadPlan,
  buildTeamSeasonScoutAuditReadPlan,
} from './playerScoutAudit.readPlan.js'


export {
  buildPlayerScoutRepairSelection,
} from './playerScoutRepair.selection.js'


export {
  canDirectRepairPlayerSearchIndexIssue,
  canDirectRepairSearchIndexIssue,
  canDirectRepairTeamSearchIndexIssue,
  repairPlayerSearchIndexIssueDirect,
  repairPlayerSearchIndexIssuesDirect,
  repairSearchIndexIssueDirect,
  repairSearchIndexIssuesDirect,
} from './playerScoutSearchIndex.directRepair.js'


export {
  buildPlayerScoutMigrationPlan,
} from './playerScoutRepair.migrationPlan.js'

export {
  verifySelectedPlayerScoutRepair,
} from './playerScoutRepair.verification.js'


export {
  TEAM_PLAYER_SCHEMA_REPAIR_TEMPLATE,
  alignTeamPlayerWithCatalogSchema,
} from './teamPlayerSchemaRepair.model.js'

export {
  applyInvalidTransferPlayerDocumentDelete,
  applyInvalidTransferPlayerSearchIndexCleanup,
  applyInvalidTransferPlayerTeamCleanup,
  buildInvalidTransferPlayerCleanupPreview,
  verifyInvalidTransferPlayerCleanup,
} from './invalidTransferPlayerCleanup.migration.js'

export {
  applyOrphanPlayerDocumentDelete,
  applyOrphanPlayerDocumentSearchIndexCleanup,
  applyOrphanPlayerDocumentTeamCleanup,
  buildOrphanPlayerDocumentCleanupPreview,
  verifyOrphanPlayerDocumentCleanup,
} from './orphanPlayerDocumentCleanup.migration.js'


export {
  PLAYER_SCOUT_DATA_HEALTH_SCOPE,
  buildPlayerScoutDataHealthAudit,
} from './playerScoutDataHealth.audit.js'
