// src/features/reports/teamMinutesPlan/teamMinutesPlan.definition.js

import {
  REPORT_TYPES,
} from '../reports.constants.js'

import {
  teamMinutesPlanSchema,
} from './persistence/teamMinutesPlan.schema.js'

import {
  normalizeTeamMinutesPlanDocument,
} from './persistence/normalizeTeamMinutesPlanDocument.js'

import {
  buildTeamMinutesPlanViewModel,
} from './presentation/buildTeamMinutesPlanViewModel.js'

export const teamMinutesPlanDefinition = {
  reportType: REPORT_TYPES.MINUTES_PLAN,
  schema: teamMinutesPlanSchema,
  normalizeContent: normalizeTeamMinutesPlanDocument,
  buildViewModel: buildTeamMinutesPlanViewModel,
}
