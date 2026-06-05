// src/features/bulkImport/index.js

export { gamesImportConfig, GAMES_IMPORT_DEFAULTS } from './configs/gamesImport.config.js'

export { parsePastedTable } from './logic/parsePastedTable.js'
export { mapImportColumns, buildMappedRows } from './logic/mapImportColumns.js'
export {
  normalizeGamesImportRow,
  normalizeGamesImportRows,
} from './logic/normalizeGamesImportRows.js'
export {
  validateGamesImportRow,
  validateGamesImportRows,
} from './logic/validateGamesImportRows.js'
export {
  buildGamesImportPreview,
  getValidGamesImportPayload,
} from './logic/buildGamesImportPreview.js'

export { default as BulkPasteDrawer } from './components/BulkPasteDrawer.js'
export { default as BulkPasteInput } from './components/BulkPasteInput.js'
export { default as BulkImportPreview } from './components/BulkImportPreview.js'
export { default as BulkImportStatusChip } from './components/BulkImportStatusChip.js'
