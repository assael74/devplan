// features/playersDatabase/services/write/teams/index.js

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
 * teamPlayerFavorite.js
 * - Updates favorite for every occurrence of a player.
 * - Scans current and history across team documents.
 *
 * teamSeason.model.js
 * - Normalizes roster players and team-season data.
 * - Builds team-season rows and merges current/history records.
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
 * - Applies season-specific player updates inside a team document.
 * - Updates player URL, position, layer, shirt number and scout profiles.
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
  appendTeamSeasonPlayer,
  updateTeamSeasonPlayerStats,
  updateTeamSeasonPlayerScoutProfiles,
  updateTeamSeasonPlayerRole,
  updateTeamSeasonPlayerRoleAndScoutProfiles,
  upsertTeamSeasonPlayers,
  updateTeamSeasonsMetaMany,
  updateTeamSeasonTeamUrl,
  updateTeamSeasonPlayerUrl,
} from './teamSeason.js'

export {
  buildTeamPlayersScoutProfilesSummary,
  clearTeamSeasonPlayers,
  removeTeamPlayerFromSeason,
  removeTeamSeason,
} from './teamDelete.js'

export {
  updatePlayerFavoriteInAllTeamSeasons,
} from './teamPlayerFavorite.js'
