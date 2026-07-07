// features/playersDatabase/components/leagues/players/logic/teamPlayersRows.logic.js

import {
  clean,
  valueOrDash,
} from '../../../../sharedLogic/index.js'

export const sortNumber = value => {
  const number = Number(value)

  return Number.isFinite(number) ? number : -1
}

export const formatLineupText = row => [
  valueOrDash(row.starts),
  valueOrDash(row.games),
].join('/')

export const mergePlayersWithStats = (players, statsBySeason) =>
  players.map(player => {
    const statsDoc = statsBySeason.get(clean(player.id)) || {}
    const stats = statsDoc.current || statsDoc || {}

    return {
      ...player,
      statsDoc,
      games: stats.games ?? player.games,
      goals: stats.goals ?? player.goals,
      yellowCards: stats.yellowCards ?? player.yellowCards,
      starts: stats.starts ?? player.starts,
      subIn: stats.subIn ?? player.subIn,
      subOut: stats.subOut ?? player.subOut,
      minutes: stats.minutes ?? player.minutes,
    }
  }).sort((a, b) => {
    const minutesDiff = sortNumber(b.minutes) - sortNumber(a.minutes)
    if (minutesDiff) return minutesDiff

    const aRow = Number(a?.source?.rowNumber) || 999
    const bRow = Number(b?.source?.rowNumber) || 999
    if (aRow !== bRow) return aRow - bRow

    return clean(a.fullName || a.playerName)
      .localeCompare(clean(b.fullName || b.playerName), 'he')
  })

export const shouldRefreshTeamIndex = (team, rows) => {
  const currentPlayersCount = Number(team?.playersCount)
  const nextPlayersCount = Array.isArray(rows) ? rows.length : 0

  return (
    Number.isFinite(nextPlayersCount) &&
    nextPlayersCount > 0 &&
    currentPlayersCount !== nextPlayersCount
  )
}
