// src/features/playersDatabase/services/read/index.js


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
  buildMovementTeamOptions,
  listExistingTeamRootOptions,
} from './entities/teamRoots.read.js'

export {
  getTeamSeason,
  getTeamSeasonByDocumentId,
  listTeamSeasons,
} from './entities/teamSeason.js'

export {
  readTeamSeasonRosterHistory,
} from './entities/teamSeasonRosterHistory.js'

export {
  readTeamPageData,
  subscribeTeamPageData,
} from './pages/teamPage.read.js'
export {
  readLeaguePageData,
  subscribeLeaguePageData,
} from './pages/leaguePage.read.js'
export {
  LEAGUES_CENTER_STORE_KEY,
  readLeagueCenterData,
  subscribeLeagueCenterData,
} from './pages/leagueCenter.read.js'
export {
  CLUBS_DIRECTORY_STORE_KEY,
  readClubPageData,
  readClubProfileDocument,
  readClubsCenterSeasonDocument,
  readClubsDirectoryDocument,
  readClubsPageData,
  subscribeClubsDirectoryDocument,
} from './pages/clubs.read.js'

export {
  readPlayerPageData,
  readPlayerSource,
  subscribePlayerPageData,
} from './pages/playerPage.read.js'
export {
  canReadPlayerSearchIndexExport,
  readPlayerSearchIndexExport,
  readPlayerSearchIndexesExport,
  readSearchIndexExportById,
} from './indexes/playerSearchIndexes.read.js'
export { readPlayerIdentityReview } from './indexes/playerIdentityReview.read.js'
export {
  readSearchPageCount,
  readSearchPageData,
  readSearchPageRows,
} from './pages/searchPage.read.js'

export {
  clearPlayersDatabaseDocumentCache,
} from '../cache/index.js'

export {
  buildLeagueTeamsForBirthYear,
  readLeagueTeamsForBirthYear,
} from './tasks/workTasks.read.js'
export {
  resetPlayersDatabaseTasksSubscription,
  subscribePlayersDatabaseTasks,
} from './tasks/tasks.read.js'
