// src/features/playersDatabase/services/write/teams/index.js

/**
 * Team write services
 *
 * teamDoc.js
 * - Creates and resolves the root team document.
 * - Owns root-level team document helpers and references.
 *
 * teamDelete.js
 * - Clears roster and statistics for one team season.
 * - Removes one team season without deleting other seasons.
 * - Supports league-season deletion flows.
 *
 * teamSeason.model.js
 * - Normalizes roster players and team-season data.
 * - Builds and normalizes one canonical Team Season document.
 * - Contains shared matching and statistics-merging helpers.
 *
 * teamSeasonRoster.js
 * - Creates the initial roster for a team season.
 * - Appends one player to an existing roster.
 *
 * teamSeasonStats.js
 * - Updates player statistics inside a team season.
 * - Merges imported statistics with the existing roster.
 *
 * teamSeasonPlayer.js
 * - Applies season-specific player updates directly to a Team Season document.
 * - Updates player URL, position, layer, shirt number and scout profiles.
 *
 * teamSeasonScoutContext.js
 * - Recalculates current player scout state after league/team context changes.
 * - Uses the canonical team-season players without changing stats-load progression.
 *
 * teamSeasonMeta.js
 * - Updates team-season URL and season metadata.
 * - Applies metadata updates across multiple team documents.
 *
 * teamSeason.js
 * - Temporary compatibility barrel for existing imports.
 * - Contains no business logic.
 */

export {
  ensureTeamDoc,
} from './teamDoc.js'

export {
  teamSeasonDocRef,
  teamSeasonDocRefById,
} from './teamSeasonDoc.js'

export {
  appendTeamSeasonPlayer,
  upsertTeamSeasonPlayers,
} from './teamSeasonRoster.js'

export {
  updateTeamSeasonPlayerStats,
} from './teamSeasonStats.js'

export {
  removeTeamSeasonPlayerScoutProfile,
  updateTeamSeasonPlayerScoutProjection,
  updateTeamSeasonPlayersScoutProjections,
  updateTeamSeasonPlayerRoleAndScoutProfiles,
  updateTeamSeasonPlayerVerificationAndScout,
  updateTeamSeasonPlayerUrl,
} from './teamSeasonPlayer.js'

export {
  updateTeamSeasonsMetaMany,
  updateTeamSeasonTeamUrl,
} from './teamSeasonMeta.js'

export {
  updateLeagueTeamPlayersScoutContextMany,
  updateTeamSeasonPlayersScoutContext,
} from './teamSeasonScoutContext.js'

export {
  buildTeamPlayersScoutProfilesSummary,
  clearTeamSeasonStats,
  clearTeamSeasonPlayerDocumentIds,
  removeTeamPlayerFromSeason,
  removeTeamSeason,
} from './teamDelete.js'


export {
  refreshTeamBalancesByDependency,
} from './teamBalanceRefresh.js'
