// preview/previewDomainCard/domains/team/games/logic/teamGames.domain.logic.js

import { DOMAIN_STATE } from '../../../../../preview.state'
import { aggSummary } from '../../../../../../../../../../shared/games/games.summary.logic.js'

import { buildTeamGamesRowsView, getGameDifficultyLabelH } from './teamGames.rows.logic.js'
import {
  getLeaguePointsSummary,
  calcLeaguePointsSummaryFromGames,
  buildLeagueStatsFromTeam,
  buildGameStatsFromSummary,
} from './teamGames.stats.logic.js'
import {
  filterTeamGames,
  buildTeamGamesFilterCounts,
} from './teamGames.filters.logic.js'
import { buildTeamGamesReadiness } from './teamGames.readiness.logic.js'

const safe = (v) => (v == null ? '' : String(v))

export { getGameDifficultyLabelH }
export { getLeaguePointsSummary }
export { filterTeamGames, buildTeamGamesFilterCounts }

export const resolveTeamGamesDomain = (team) => {
  const built = buildTeamGamesRowsView(team)
  const rows = built?.rows || []
  const summary = built?.summary || aggSummary([])
  const nextGame = built?.nextGame || null
  
  const leaguePoints = calcLeaguePointsSummaryFromGames(rows)
  const leagueStats = buildLeagueStatsFromTeam(team)
  const gameStats = buildGameStatsFromSummary({
    summary,
    rows,
    built,
    leaguePoints,
  })

  const readiness = buildTeamGamesReadiness({
    leagueStats,
    gameStats,
  })

  return {
    state: rows.length ? DOMAIN_STATE.OK : DOMAIN_STATE.EMPTY,
    rows,
    playedGames: built?.playedGames || [],
    upcomingGames: built?.upcomingGames || [],

    summary: {
      ...summary,

      league: safe(team?.league) || '—',
      leagueLevel: safe(team?.leagueLevel) || '—',
      position: safe(team?.leaguePosition || team?.position) || '—',

      leagueStats,
      gameStats,
      readiness,
      leaguePoints,

      nextGame: nextGame
        ? {
            rival: nextGame.rival || nextGame.rivel || '—',
            dateRaw: nextGame.dateRaw || '',
            dateLabel: nextGame.dateLabel || nextGame.dateH || '—',
            hourRaw: nextGame.hourRaw || '',
            homeLabel: nextGame.homeLabel || '—',
            typeH: nextGame.typeH || '—',
          }
        : null,
    },
  }
}
