// teamProfile/sharedLogic/games/index.js

export {
  createInitialTeamGamesFilters,
  resolveTeamGamesFiltersDomain,
} from './moduleLogic/teamGames.filters.logic.js'

export {
  buildToolbarState,
  clearToolbarIndicator,
  pickToolbarOption,
  getHomeOptionColor,
  safeArray,
} from './moduleLogic/teamGames.toolbar.utils.js'

export {
  getResultKey,
  getResultLabel,
  getResultColor,
  getHomeAwayLabel,
  getHomeAwayIcon,
  getHomeAwayColor,
  getGamePlayers,
  getGamePlayers as getSectionGamePlayers,
  getSquadPlayers,
  getPlayedPlayers,
  getScorers,
  getAssisters,
} from './moduleLogic/teamGames.section.utils.js'

export {
  TEAM_GAMES_SORT_OPTIONS,
  getTeamGamesSortLabel,
  getTeamGamesSortDirectionIcon,
  sortTeamGamesRows,
} from './moduleLogic/teamGames.sort.logic.js'

export {
  buildTeamGamesDrawerViewModel,
  buildTeamGamesTopStats,
  buildTeamGamesCards,
  buildHomeAwayInsightItems,
  buildDifficultyInsightItems,
  buildFeedInsightItems,
} from './insightsLogic/teamGames.cards.logic.js'

export {
  buildInitialDraft as buildTeamGameEntryInitialDraft,
  buildPatch as buildTeamGameEntryPatch,
  clampStatToRowLimit,
  getIsDirty as getTeamGameEntryIsDirty,
  getIsValid as getTeamGameEntryIsValid,
  getValidationMessage,
  setRowField,
  getGoalsTotal,
  getAssistsTotal,
  getGameDurationLimit,
  getRemainingAssistsForRow,
  getRemainingGoalsForRow,
  getTeamGoalsLimit,
} from './entryLogic/teamGameEntryEdit.logic.js'

export {
  buildInitialDraft as buildTeamGameInitialDraft,
  buildPatch as buildTeamGamePatch,
  getFieldErrors,
  getIsDirty as getTeamGameIsDirty,
  getIsValid as getTeamGameIsValid,
  calcResultByGoals,
  calcPointsByResult,
  buildGameName,
  buildGameMeta,
} from './drawerLogic/teamGameEdit.logic.js'
