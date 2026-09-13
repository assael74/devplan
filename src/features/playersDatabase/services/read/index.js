// src/features/playersDatabase/services/read/index.js

export { readFavorites } from './entities/favorites.read.js'

export {
  getLeagueById,
  hasLeagueById,
  listLeagues,
  listLeaguesByIds,
} from './entities/league.js'

export {
  getTeamById,
} from './entities/team.js'

export {
  getTeamSeason,
  listTeamSeasons,
} from './entities/teamSeason.js'

export { readTeamPageData } from './pages/teamPage.read.js'
export { buildLeagueTeamPerformanceProjection } from './projections/teamPerformance.projection.js'
export { readLeaguePageData } from './pages/leaguePage.read.js'
export { readLeagueCenterData } from './pages/leagueCenter.read.js'
export { readLeaguesMasterDocument } from './masters/leaguesMaster.read.js'
export { readClubsMasterDocument } from './masters/clubsMaster.read.js'
export { readClubSeasonIdentityIndex } from './masters/clubSeasonIdentityIndex.read.js'
export { readClubPageDocument } from './pages/clubPage.read.js'

export {
  readPlayerPageData,
  readPlayerSource,
} from './pages/playerPage.read.js'
export {
  canReadPlayerSearchIndexExport,
  canReadTeamSearchIndexExport,
  readPlayerSearchIndexExport,
  readSearchIndexExportById,
  readTeamSearchIndexExport,
  readTeamSearchIndexesExport,
} from './indexes/playerSearchIndexExport.read.js'
export { readPlayerScoutMeasurementHistory } from './indexes/playerScoutHistory.read.js'
export { readPlayerIdentityReview } from './indexes/playerIdentityReview.read.js'
export {
  readSearchPageCount,
  readSearchPageData,
  readSearchPageRows,
} from './pages/searchPage.read.js'

export {
  clearPlayersDatabaseDocumentCache,
  getPlayersDatabaseCacheDebugSnapshot,
} from '../cache/index.js'

export {
  buildLeagueTeamsForBirthYear,
  readLeagueTeamsForBirthYear,
} from './tasks/workTasks.read.js'
export { subscribePlayersDatabaseTasks } from './tasks/tasks.read.js'
