// features/playersDatabase/services/write/flows/league/leagueTableRank.js

/**
 * Compatibility export only.
 *
 * The active league table-rank writer lives under:
 * services/write/leagues/leagueTableRank.js
 *
 * Business orchestration for importing a league table lives under:
 * services/write/flows/league/pasteLeagueTable.flow.js
 *
 * Keep this file temporarily so older direct imports do not break.
 */

export {
  updateLeagueSeasonTableRank,
  updateLeagueSeasonTableRankScoutProfilesSummary,
  updateLeagueSeasonTableRankTeamUrl,
} from '../../leagues/leagueTableRank.js'
