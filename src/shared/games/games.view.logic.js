/// shared/games/games.view.logic.js
import { aggSummary } from './games.summary.logic.js'
import { splitPlayedUpcoming, findNextGame } from './games.time.logic.js'

export const DOMAIN_STATE = {
  EMPTY: 'empty',
  OK: 'ok',
}

export const buildGamesView = (baseRows, normalizeRow) => {
  const base = Array.isArray(baseRows) ? baseRows : []
  const rows = base.map(normalizeRow).filter((x) => x && x.id)

  const state = rows.length ? DOMAIN_STATE.OK : DOMAIN_STATE.EMPTY

  const { played, upcoming } = splitPlayedUpcoming(rows)
  const nextGame = findNextGame(upcoming)

  const summaryAll = aggSummary(rows)
  const summaryPlayed = aggSummary(played)

  return {
    state,
    rows,
    playedGames: played,
    upcomingGames: upcoming,
    nextGame,
    summary: summaryAll,
    summaryPlayed,
  }
}
