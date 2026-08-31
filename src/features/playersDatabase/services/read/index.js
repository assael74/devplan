// src/features/playersDatabase/services/read/index.js

export { readFavorites } from './favorites.read.js'

export {
  getLeagueById,
  hasLeagueById,
  listLeagues,
  listLeaguesByIds,
} from './league.js'

export {
  getTeamById,
} from './team.js'

export {
  getTeamSeason,
  listTeamSeasons,
} from './teamSeason.js'

export { readTeamPageData } from './teamPage.read.js'
export { readLeaguePageData } from './leaguePage.read.js'
export { readLeagueCenterData } from './leagueCenter.read.js'
export { readLeaguesMasterDocument } from './leaguesMaster.read.js'

export {
  readPlayerPageData,
  readPlayerSource,
} from './playerPage.read.js'
export {
  canReadPlayerSearchIndexExport,
  canReadTeamSearchIndexExport,
  readPlayerSearchIndexExport,
  readTeamSearchIndexExport,
} from './playerSearchIndexExport.read.js'
export { readPlayerNarrativePlan } from './playerNarrative.read.js'
export { readPlayerScoutMeasurementHistory } from './playerScoutHistory.read.js'
export { readPlayerIdentityReview } from './playerIdentityReview.read.js'
export {
  readSearchPageCount,
  readSearchPageData,
  readSearchPageRows,
} from './searchPage.read.js'

export {
  clearPlayersDatabaseDocumentCache,
  getPlayersDatabaseCacheDebugSnapshot,
} from '../cache/index.js'

export {
  buildLeagueTeamsForBirthYear,
  readLeagueTeamsForBirthYear,
} from './workTasks.read.js'
export { subscribePlayersDatabaseTasks } from './tasks.read.js'
