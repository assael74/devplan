// src/features/reports/index.js

export {
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
  PUBLIC_REPORT_SCHEMA_VERSION,
  PUBLIC_REPORT_STATUS,
} from './reports.constants.js'

export {
  getReportDefinition,
  isReportTypeSupported,
  renderReport,
} from './registry/index.js'

export {
  PUBLIC_REPORTS_COLLECTION,
  PUBLIC_REPORT_VERSIONS_COLLECTION,
  PUBLIC_REPORT_VIEWS_COLLECTION,
  PUBLIC_REPORT_INDEXES_COLLECTION,
  PUBLIC_REPORT_ROUTE,
  PUBLIC_REPORT_VERSION_PREFIX,
  PUBLIC_REPORT_VERSION_PADDING,
  PUBLIC_REPORT_ERROR_CODES,
  publicReportsCollectionRef,
  publicReportIndexesCollectionRef,
  publicReportRef,
  publicReportVersionsCollectionRef,
  publicReportVersionRef,
  publicReportViewsCollectionRef,
  buildPublicReportSourceKey,
  buildPublicReportId,
  buildPublicReportVersionId,
  buildPublicReportUrl,
  buildPublicReportShareUrl,
  buildPublicReportShareText,
  publishPublicReport,
  publishPublicReportDocument,
  revokePublicReport,
  deletePublicReport,
  updatePublicReportIndexDocument,
  getPublishedPublicReports,
  getCurrentPublicReport,
  getPublicReportVersion,
  getPublicReport,
} from './service/index.js'

export {
  publishTeamPlayersReport,
  publishReport,
} from './publishTeamPlayersReport.js'

export {
  publishPublicReport as runPublishPublicReport,
  revokePublicReport as runRevokePublicReport,
  deletePublicReport as runDeletePublicReport,
  getPublishedPublicReports as runGetPublishedPublicReports,
  getCurrentPublicReport as runGetCurrentPublicReport,
  getPublicReportVersion as runGetPublicReportVersion,
  getPublicReport as runGetPublicReport,
} from './service/index.js'

export {
  publishTeamTargetsReport as publishManagementTargetsReport,
} from './teamTargets/index.js'

export {
  publishPlayerTargetsReport,
} from './playerTargets/index.js'


// Backward-compatible report builders without the legacy model barrel.
export {
  buildTeamTargetsPublicReportInput as buildManagementTargetsPublicReportInput,
  buildTeamTargetsDocument as buildManagementTargetsReportContent,
} from './teamTargets/index.js'

export {
  buildPlayerTargetsPublicReportInput,
  buildPlayerTargetsDocument as buildPlayerTargetsReportContent,
} from './playerTargets/index.js'

export * from './teamTargets/presentation/print/index.js'

export {
  buildPlayerTargetsPrintModel,
  buildPlayerTargetsPrintViewModel,
} from './playerTargets/presentation/playerTargetsPrintModel.js'

export {
  sanitizeReportValue,
  asReportArray,
  asReportObject,
  asReportText,
  asReportNumber,
  pickReportEntity,
  pickReportMetaItems,
  pickReportColumns,
  pickReportRows,
  pickReportFilters,
  pickReportCounts,
} from './service/reportValue.js'

export {
  ExternalReportRenderer,
} from './renderers/external/index.js'

export * from './performance/index.js'

export {
  default as PublicReportPage,
} from './public/PublicReportPage.js'

export {
  default as DashboardPage,
} from './dashboard/DashboardPage.js'

export {
  PlayerTargetsReportButton,
} from './playerTargets/index.js'

export {
  TeamTargetsReportButton,
  buildTeamTargetsDocument,
  normalizeTeamTargetsDocument,
  buildTeamTargetsViewModel,
  buildTeamTargetsPublicReportInput,
  publishTeamTargetsReport,
  teamTargetsDefinition,
} from './teamTargets/index.js'

export {
  TEAM_SEASON_PLAN_DOCUMENT_VERSION,
  buildTeamSeasonPlanDocument,
  normalizeTeamSeasonPlanDocument,
  buildTeamSeasonPlanViewModel,
  buildTeamSeasonPlanPublicReportInput,
  publishTeamSeasonPlanReport,
  publishTeamSeasonPlan,
  teamSeasonPlanDefinition,
} from './teamSeasonPlan/index.js'

export {
  TEAM_MINUTES_PLAN_DOCUMENT_VERSION,
  buildTeamMinutesPlanDocument,
  normalizeTeamMinutesPlanDocument,
  buildTeamMinutesPlanViewModel,
  buildTeamMinutesPlanPublicReportInput,
  publishTeamMinutesPlanReport,
  publishTeamMinutesPlan,
  teamMinutesPlanDefinition,
} from './teamMinutesPlan/index.js'
