// features/playersDatabase/services/write/searchIndex/team/index.js

/**
 * Team-season search-index write services
 *
 * teamSeasonIndex.model.js
 * - Builds the team-season index identity and complete document shape.
 * - Normalizes league-table and team-scoring values used by the index.
 *
 * teamSeasonIndex.upsert.js
 * - Creates or refreshes team-season index documents from league-table rows.
 *
 * teamSeasonIndex.patch.js
 * - Applies focused updates to one team-season index document.
 * - Updates roster metadata, team URL and scout-profile summaries.
 *
 * teamSeasonIndex.bulk.js
 * - Applies season-level updates to multiple team-season index documents.
 *
 * teamSeasonIndex.write.js
 * - Compatibility export that groups upsert, patch and bulk writers.
 *
 * teamSeason.js
 * - Legacy compatibility export for older direct imports.
 * - Contains no business implementation.
 */

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
