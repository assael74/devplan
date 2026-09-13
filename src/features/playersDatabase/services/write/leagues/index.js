// src/features/playersDatabase/services/write/leagues/index.js

/**
 * League write services
 *
 * leagueDoc.js
 * - Builds and ensures the root league document.
 * - Exposes shared league document references and normalization helpers.
 *
 * leagueSeason.js
 * - Creates and patches a specific league season.
 * - Updates season URL and season metadata by leagueId + seasonId.
 *
 * leagueTableRank.js
 * - Writes the canonical tableRank array for a specific league season.
 *
 * leagueTableRankTeamSync.js
 * - Updates URL, roster/stats sync metadata for a matching team row.
 *
 * leagueTableRankScoutSummary.js
 * - Updates scout-profile summaries and task signals for matching team rows.
 *
 * leagueTableRank.model.js
 * - Pure table-rank transformations and persisted-state comparison helpers.
 *
 * leagueDelete.js
 * - Removes or clears league data at season scope.
 * - Resolves dependencies required by large delete flows.
 *
 * leaguesMaster.model.js
 * - Builds league and season projections for the master catalog.
 * - Calculates summary counts and normalizes master entries.
 *
 * leaguesMaster.sync.js
 * - Reads source league documents and synchronizes the master catalog transaction.
 * */

export {
  buildSeasonKey,
  ensureLeagueDoc,
} from './leagueDoc.js'

export {
  updateLeagueSeasonMeta,
  updateLeagueSeasonSettings,
  updateLeagueSeasonUrl,
  upsertLeagueSeason,
} from './leagueSeason.js'

export {
  updateLeagueSeasonTableRank,
} from './leagueTableRank.js'

export {
  updateLeagueSeasonTableRankTeamSyncMeta,
  updateLeagueSeasonTableRankTeamUrl,
} from './leagueTableRankTeamSync.js'

export {
  updateLeagueSeasonTableRankScoutProfilesSummary,
  updateLeagueSeasonTableRankScoutProfilesSummaries,
} from './leagueTableRankScoutSummary.js'

export {
  clearLeagueSeasonTeams,
  getLeagueSeasonDeleteDependencies,
  getLeagueSeasonTeams,
  removeLeagueSeason,
  removeLeagueSeasonTeam,
} from './leagueDelete.js'

export {
  syncLeaguesMasterDocument,
} from './leaguesMaster.sync.js'
