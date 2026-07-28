// src/features/reports/teamTargets/teamTargets.definition.js

import { REPORT_TYPES } from '../reports.constants.js'
import { teamTargetsSchema } from './persistence/teamTargets.schema.js'
import { normalizeTeamTargetsDocument } from './persistence/normalizeTeamTargetsDocument.js'
import { buildTeamTargetsViewModel } from './presentation/buildTeamTargetsViewModel.js'

export const teamTargetsDefinition = {
  reportType: REPORT_TYPES.TEAM_TARGETS,
  schema: teamTargetsSchema,
  normalizeContent: normalizeTeamTargetsDocument,
  buildViewModel: buildTeamTargetsViewModel,
}
