// clubProfile/sharedLogic/players/moduleLogic/clubPlayers.logic.js

import {
  norm,
  normalizeClubPlayerRow,
} from './clubPlayers.row.logic.js'

import {
  buildRowsSummary,
} from './clubPlayers.summary.logic.js'

const sortClubPlayerRows = rows => {
  return [...rows].sort((a, b) => {
    const activeDiff =
      Number(b?.active !== false) -
      Number(a?.active !== false)

    if (activeDiff !== 0) return activeDiff

    const keyDiff =
      Number(b?.isKey) -
      Number(a?.isKey)

    if (keyDiff !== 0) return keyDiff

    return norm(a?.fullName).localeCompare(norm(b?.fullName), 'he')
  })
}

const buildRowsById = rows => {
  return rows.reduce((acc, row) => {
    if (row?.playerId) {
      acc[row.playerId] = row
    }

    return acc
  }, {})
}

export const buildClubPlayerRows = ({ club, players = [], performanceById = {}, } = {}) => {
  const safePlayers = Array.isArray(players) ? players : []

  const rows = sortClubPlayerRows(
    safePlayers.map(player => {
      return normalizeClubPlayerRow(player, club)
    })
  )

  return {
    rows,
    byId: buildRowsById(rows),
    summary: buildRowsSummary({
      rows,
      performanceById,
    }),
  }
}
