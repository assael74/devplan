// features/hub/editLogic/games/entryGames/index.js

export {
  safe,
  clean,
  toNum,
  toNumOrEmpty,
  toArr,
  normalizeBool,
  getGameSource,
  getGameId,
  getPlayerId,
  getGamePlayers,
  getPlayerDisplayName,
  buildEntryGameMeta,
} from './entryGame.shared.js'

export {
  buildPlayerGameEntryInitial,
  isPlayerGameEntryDirty,
  buildUpdatePlayerGameEntryPatch,
  buildRemovePlayerGameEntryPatch,
  getPlayerGameEntryLimits,
} from './playerGameEntry.model.js'

export {
  getTeamPlayers,
  isGamePlayed,
  getGameDurationLimit,
  getTeamGoalsLimit,
  getGoalsTotal,
  getAssistsTotal,
  getOnStartTotal,
  buildTeamGameEntryRow,
  buildTeamGameEntryInitial,
  getRemainingGoalsForRow,
  getRemainingAssistsForRow,
  clampTeamGameEntryStatToRowLimit,
  setTeamGameEntryRowField,
  isTeamGameEntryRowDirty,
  getTeamGameEntryDirtyRows,
  isTeamGameEntryDirty,
  getIsTeamGameEntryValid,
  getTeamGameEntryValidationMessage,
  sanitizeTeamGameEntryForSave,
  buildTeamGameEntryPatch,
} from './teamGameEntry.model.js'
