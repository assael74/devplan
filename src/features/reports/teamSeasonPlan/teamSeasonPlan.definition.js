// src/features/reports/teamSeasonPlan/teamSeasonPlan.definition.js

import {
  REPORT_TYPES,
} from '../reports.constants.js'

import {
  teamSeasonPlanSchema,
} from './persistence/teamSeasonPlan.schema.js'

import {
  normalizeTeamSeasonPlanDocument,
} from './persistence/normalizeTeamSeasonPlanDocument.js'

import {
  buildTeamSeasonPlanViewModel,
} from './presentation/buildTeamSeasonPlanViewModel.js'

export const teamSeasonPlanDefinition = {
  reportType: REPORT_TYPES.SEASON_PLAN,
  schema: teamSeasonPlanSchema,
  normalizeContent: normalizeTeamSeasonPlanDocument,
  buildViewModel: buildTeamSeasonPlanViewModel,
}
