// src/features/bulkActions/games/delete/index.js

export {
  GAMES_DELETE_SCOPE,
  GAMES_DELETE_SCOPE_OPTIONS,
  GAMES_DELETE_CONFIRM_MODE,
  GAMES_DELETE_STATUS,
} from './configs/gamesDelete.config.js'

export { resolveGamesDeleteScope } from './logic/resolveGamesDeleteScope.js'
export { buildGamesDeleteSummary } from './logic/buildGamesDeleteSummary.js'
export { buildGamesDeletePlan } from './logic/buildGamesDeletePlan.js'
export { validateGamesDeletePlan } from './logic/validateGamesDeletePlan.js'

export { default as GamesBulkDeleteModal } from './components/GamesBulkDeleteModal.js'
export { default as GamesBulkDeletePreview } from './components/GamesBulkDeletePreview.js'
export { default as GamesBulkDeleteSummary } from './components/GamesBulkDeleteSummary.js'
export { default as GamesBulkDeleteConfirmBox } from './components/GamesBulkDeleteConfirmBox.js'
export { default as GamesBulkDeleteStatusChip } from './components/GamesBulkDeleteStatusChip.js'
