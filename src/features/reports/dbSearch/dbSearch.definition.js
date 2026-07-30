// src/features/reports/dbSearch/dbSearch.definition.js

import { REPORT_TYPES } from '../reports.constants.js'
import { dbSearchSchema } from './persistence/dbSearch.schema.js'
import { normalizeDbSearchDocument } from './persistence/normalizeDbSearchDocument.js'
import { buildDbSearchViewModel } from './presentation/buildDbSearchViewModel.js'

export const dbSearchDefinition = {
  reportType: REPORT_TYPES.DB_SEARCH,
  schema: dbSearchSchema,
  normalizeContent: normalizeDbSearchDocument,
  buildViewModel: buildDbSearchViewModel,
}
