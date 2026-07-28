// src/features/reports/playerTargets/playerTargets.definition.js

import { REPORT_TYPES } from '../reports.constants.js'
import { playerTargetsSchema } from './persistence/playerTargets.schema.js'
import { normalizePlayerTargetsDocument } from './persistence/normalizePlayerTargetsDocument.js'
import { buildPlayerTargetsViewModel } from './presentation/buildPlayerTargetsViewModel.js'

export const playerTargetsDefinition = {
  reportType: REPORT_TYPES.PLAYER_TARGETS,
  schema: playerTargetsSchema,
  normalizeContent: normalizePlayerTargetsDocument,
  buildViewModel: buildPlayerTargetsViewModel,
}
