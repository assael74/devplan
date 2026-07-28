// src/features/reports/teamTargets/index.js

export {
  default as TeamTargetsReportButton,
} from './integration/TeamTargetsReportButton.js'

export {
  TEAM_TARGETS_DOCUMENT_VERSION,
  buildTeamTargetsDocument,
} from './persistence/buildTeamTargetsDocument.js'

export {
  normalizeTeamTargetsDocument,
} from './persistence/normalizeTeamTargetsDocument.js'

export {
  buildTeamTargetsViewModel,
} from './presentation/buildTeamTargetsViewModel.js'

export {
  buildTeamTargetsPublicReportInput,
  publishTeamTargetsReport,
} from './publishTeamTargetsReport.js'

export {
  teamTargetsDefinition,
} from './teamTargets.definition.js'

export {
  default as ManagementTargetsReportRenderer,
} from './renderer/ManagementTargetsReportRenderer.js'

export {
  default as ManagementReportRoot,
} from './renderer/ReportRoot.js'
