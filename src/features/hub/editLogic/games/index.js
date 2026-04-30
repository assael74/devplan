// features/hub/editLogic/games/index.js

export {
  safe,
  clean,
  toNumOrEmpty,
  calcResultByGoals,
  calcPointsByResult,
  buildGameName,
  buildGameMeta,
  buildGameEditInitial,
  buildGameEditPatch,
  isGameEditDirty,
} from './gameEdit.model.js'

export {
  getGameEditFieldErrors,
  getIsGameEditValid,
} from './gameEdit.validation.js'

export {
  buildGamePlayerEditInitial,
  isGamePlayerEditDirty,
  buildUpdateGamePlayersPatch,
  buildRemovePlayerFromGamePatch,
  getGameStatsLimits,
} from './gamePlayerEdit.model.js'

export {
  canEditGameFromContext,
} from './gameEdit.permissions.js'
