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
  publishPublicReport as runPublishPublicReport,
  revokePublicReport as runRevokePublicReport,
  deletePublicReport as runDeletePublicReport,
  getPublishedPublicReports as runGetPublishedPublicReports,
  getCurrentPublicReport as runGetCurrentPublicReport,
  getPublicReportVersion as runGetPublicReportVersion,
  getPublicReport as runGetPublicReport,
} from './application/index.js'

export {
  publishTeamPlayersReport,
  publishManagementTargetsReport,
  publishPlayerTargetsReport,
} from './flows/index.js'

export * from './model/index.js'
export * from './renderers/index.js'

export {
  default as PublicReportPage,
} from './public/PublicReportPage.js'

export {
  default as DashboardPage,
} from './dashboard/DashboardPage.js'
