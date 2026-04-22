// teamProfile/sharedLogic/games/entryLogic/teamGameEntryEdit.logic.js

export {
  safe,
  toNumOrEmpty,
  toNum,
  normalizeBool,
  getGameSource,
  buildDrawerMeta,
  getPlayerDisplayName,
} from './teamGameEntryEdit.shared.js'

export {
  getGameDurationLimit,
  getTeamGoalsLimit,
  getGoalsTotal,
  getAssistsTotal,
  getOnStartTotal,
  getGamePlayers,
  getTeamPlayers,
  isGamePlayed,
} from './teamGameEntryEdit.selectors.js'

export {
  buildRowFromPlayer,
  buildInitialDraft,
} from './teamGameEntryEdit.draft.js'

export {
  getRemainingGoalsForRow,
  getRemainingAssistsForRow,
  clampStatToRowLimit,
  setRowField,
} from './teamGameEntryEdit.rows.js'

export {
  isRowDirty,
  getDirtyRows,
  getIsDirty,
  getIsValid,
  getValidationMessage,
} from './teamGameEntryEdit.validation.js'

export {
  sanitizeEntryForSave,
  buildPatch,
} from './teamGameEntryEdit.patch.js'
