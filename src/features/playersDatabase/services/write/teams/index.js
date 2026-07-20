// features/playersDatabase/services/write/teams/index.js

export {
  ensureTeamDoc,
} from './teamDoc.js'

export {
  updateTeamSeasonPlayerStats,
  updateTeamSeasonPlayerScoutProfiles,
  updateTeamSeasonPlayerRole,
  upsertTeamSeasonPlayers,
  updateTeamSeasonsMetaMany,
  updateTeamSeasonTeamUrl,
} from './teamSeason.js'

export {
  buildTeamPlayersScoutProfilesSummary,
  removeTeamPlayerFromSeason,
  removeTeamSeason,
} from './teamDelete.js'
