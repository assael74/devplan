// src/features/playersDatabase/services/write/teams/teamSeason.js

/**
 * Compatibility export for team-season write services.
 *
 * New code should import from the focused files or from teams/index.js.
 * This file remains temporarily to preserve existing imports during the refactor.
 */

export {
  appendTeamSeasonPlayer,
  upsertTeamSeasonPlayers,
} from './teamSeasonRoster.js'

export {
  updateTeamSeasonPlayerStats,
} from './teamSeasonStats.js'

export {
  removeTeamSeasonPlayerScoutProfile,
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
