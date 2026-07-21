// features/playersDatabase/services/write/searchIndex/player/index.js

export {
  upsertPlayerSeasonSearchIndexMany,
} from './playerSeasonIndex.upsert.js'

export {
  updatePlayerSeasonSearchIndexStatsMany,
} from './playerSeasonIndex.stats.js'

export {
  clearPlayerSeasonSearchIndexScoutProfile,
  updatePlayerSeasonSearchIndexFields,
  updatePlayerSeasonSearchIndexNotes,
  updatePlayerSeasonSearchIndexPlayerUrl,
  updatePlayerSeasonSearchIndexRole,
} from './playerSeasonIndex.patch.js'

export {
  updatePlayerFavoriteSearchIndexes,
  updatePlayerSeasonSearchIndexesSeasonMeta,
  updatePlayerSeasonSearchIndexTeamUrl,
} from './playerSeasonIndex.bulk.js'
