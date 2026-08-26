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
 * - Writes the tableRank array for a specific league season.
 * - Updates a team row URL and roster metadata inside that season.
 * - Updates scout-profile summaries for the matching team row.
 * - Does not orchestrate team-index or master-document writes.
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
 *
 * leaguesMaster.js
 * - Compatibility export for existing imports.
 */

export {
  buildSeasonKey,
  ensureLeagueDoc,
} from './leagueDoc.js'

export {
  updateLeagueSeasonMeta,
  updateLeagueSeasonUrl,
  upsertLeagueSeason,
} from './leagueSeason.js'

export {
  updateLeagueSeasonTableRankScoutProfilesSummary,
  updateLeagueSeasonTableRankScoutProfilesSummaries,
  updateLeagueSeasonTableRankTeamSyncMeta,
  updateLeagueSeasonTableRankTeamUrl,
  updateLeagueSeasonTableRank,
} from './leagueTableRank.js'

export {
  clearLeagueSeasonTeams,
  getLeagueSeasonDeleteDependencies,
  getLeagueSeasonTeams,
  removeLeagueSeason,
  removeLeagueSeasonTeam,
} from './leagueDelete.js'

export {
  syncLeaguesMasterDocument,
} from './leaguesMaster.js'
