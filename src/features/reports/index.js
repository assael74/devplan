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
} from './reports.registry.js'

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
  publishReport,
} from './service/publishReport.flow.js'

export {
  publishTeamPlayersReport,
  publishPlayerTargetsReport,
} from './flows/index.js'

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
  buildTeamPlayersPublicReportInput,
  buildManagementTargetsPublicReportInput,
  buildPlayerTargetsPublicReportInput,
  buildSeasonPlanReportContent,
  buildMinutesPlanReportContent,
  buildManagementTargetsReportContent,
  buildPlayerTargetsReportContent,
} from './model/index.js'

export {
  default as PublicReportPage,
} from './public/PublicReportPage.js'

export {
  default as DashboardPage,
} from './dashboard/DashboardPage.js'
