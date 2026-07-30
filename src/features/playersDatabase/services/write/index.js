// features/playersDatabase/services/write/index.js

/**
 * Public entry point for players-database write services.
 *
 * leagues/
 * - League-document and league-season writes.
 *
 * searchIndex/
 * - Player-season and team-season search-index writes.
 *
 * router.js
 * - Routes named write actions to the active write flow.
 *
 * flows/
 * - Coordinates multi-document business operations.
 */

export {
  buildSeasonKey,
  ensureLeagueDoc,
  updateLeagueSeasonTableRankTeamUrl,
  updateLeagueSeasonTableRank,
  upsertLeagueSeason,
} from './leagues/index.js'

export * from './searchIndex/index.js'
export * from './favorites/index.js'

export {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from './router.js'

export {
  createLeagueSeasonFlow,
} from './flows/league/index.js'

export {
  clearPlayersDatabaseDocumentCache,
  getPlayersDatabaseCacheDebugSnapshot,
} from '../cache/index.js'
