// features/playersDatabase/services/write/searchIndex/index.js

export {
  updateSearchIndexesLeagueSeasonUrl,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
  updateTeamSeasonSearchIndexTeamUrl,
  updateTeamSeasonSearchIndexRosterMeta,
  updateTeamSeasonSearchIndexesSeasonMeta,
  upsertTeamSeasonSearchIndexMany,
} from './teamSeasonIndex.js'

export {
  clearPlayerSeasonSearchIndexScoutProfile,
  updatePlayerFavoriteSearchIndexes,
  updatePlayerSeasonSearchIndexNotes,
  updatePlayerSeasonSearchIndexRole,
  updatePlayerSeasonSearchIndexPlayerUrl,
  updatePlayerSeasonSearchIndexFields,
  updatePlayerSeasonSearchIndexTeamUrl,
  updatePlayerSeasonSearchIndexStatsMany,
  updatePlayerSeasonSearchIndexesSeasonMeta,
  upsertPlayerSeasonSearchIndexMany,
} from './playerSeasonIndex.js'

export {
  deleteSearchIndexForTeamPlayerSeason,
  deleteSearchIndexesForLeagueSeason,
  deleteSearchIndexesForTeamSeason,
} from './searchIndexDelete.js'
