// playerProfile/sharedLogic/index.js

// ----- ABILITIES -----
export * from './abilities/insightsDrawerLogic/abilitiesInsightsDrawer.logic.js'
export * from './abilities/inviteDrawerLogic/abilitiesInvite.logic.js'
export * from './abilities/moduleLogic/abilities.logic.js'
export { default as useAbilitiesSummary } from './abilities/moduleLogic/useAbilitiesSummary.js'

// ----- GAMES / FILTERS -----
export {
  applyPlayerGamesFilters,
  buildPlayerGamesSummary,
  matchesPlayerGameSearch,
} from './games/module/playerGames.filters.apply.js'

export {
  PLAYER_GAMES_FILTER_KEYS,
  PLAYER_GAMES_OPTION_CONFIG,
  PLAYER_GAMES_INDICATOR_CONFIG,
} from './games/module/playerGames.filters.constants.js'

export {
  findPlayerGameEntry,
  enrichGameWithPlayerLocalMeta,
} from './games/module/playerGames.filters.enrich.js'

export {
  createInitialPlayerGamesFilters,
  resolvePlayerGamesFiltersDomain,
} from './games/module/playerGames.filters.logic.js'

export {
  buildPlayerGamesOptions,
  buildPlayerGamesIndicators,
} from './games/module/playerGames.filters.options.js'

export {
  PLAYER_GAMES_SORT_OPTIONS,
  getPlayerGamesSortLabel,
  getPlayerGamesSortDirectionIcon,
  sortPlayerGamesRows
} from './games/module/playerGames.sort.logic.js'

export {
  getResultKey,
  getResultIcon,
  getResultLabel,
  getResultColor,
  getHomeAwayLabel,
  getHomeAwayIcon,
  getHomeAwayColor,
  getGamePlayers,
  getSquadPlayers,
  getPlayedPlayers,
  getScorers,
  getAssisters,
} from './games/module/playerGames.section.utils.js'

export {
  safeArray,
  pickToolbarOption,
  getHomeOptionColor,
  buildToolbarState,
  clearToolbarIndicator,
} from './games/module/playerGames.toolbar.utils.js'


// ----- MEETINGS / MODULE -----
export * from './meetings/module/meetings.buckets.js'
export * from './meetings/module/meetings.filters.js'
export * from './meetings/module/meetings.normalize.js'
export { default as useMeetingsWorkspace } from './meetings/module/useMeetingsWorkspace.js'
export { default } from './meetings/module/useMeetingsWorkspace.js'

// ----- PAYMENTS / MODULE -----
export * from './payments/index.js'

// ----- TRAININGS / MODULE -----
export * from './trainings/index.js'

// ----- VIDEOS / MODULE -----
export * from './videos/module/playerVideos.domain.logic.js'
export * from './videos/module/playerVideos.filters.logic.js'
export * from './videos/module/playerVideos.sort.logic.js'

// ----- VIDEOS / INSIGHTS DRAWER -----
export * from './videos/insightsDrawer/videosInsightsDrawer.logic.js'

// ----- PERFORMANCE / MODULE -----
export * from './performance/performance.domain.logic.js'
