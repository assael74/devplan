// features/playersDatabase/services/write/leagues/index.js

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
  updateLeagueSeasonTableRankTeamUrl,
  updateLeagueSeasonTableRank,
} from './leagueTableRank.js'

export {
  removeLeagueSeason,
  removeLeagueSeasonTeam,
} from './leagueDelete.js'
