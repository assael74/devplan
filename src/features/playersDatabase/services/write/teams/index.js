// features/playersDatabase/services/write/teams/index.js

export {
  ensureTeamDoc,
} from './teamDoc.js'

export {
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
  removeTeamPlayerFromSeason,
  removeTeamSeason,
} from './teamDelete.js'
