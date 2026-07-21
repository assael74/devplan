// features/playersDatabase/services/write/searchIndex/team/index.js

export {
  buildTeamSeasonIndexId,
} from './teamSeasonIndex.model.js'

export {
  upsertTeamSeasonSearchIndexMany,
} from './teamSeasonIndex.upsert.js'

export {
  updateTeamSeasonSearchIndexRosterMeta,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
  updateTeamSeasonSearchIndexTeamUrl,
} from './teamSeasonIndex.patch.js'

export {
  updateSearchIndexesLeagueSeasonUrl,
  updateTeamSeasonSearchIndexesSeasonMeta,
} from './teamSeasonIndex.bulk.js'
