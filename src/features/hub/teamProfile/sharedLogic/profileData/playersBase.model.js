// src/features/hub/teamProfile/sharedLogic/profileData/playersBase.model.js

import {
  resolveTeamPlayers,
} from '../players/index.js'

const emptyArray = []

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const getPlayerId = row => {
  return asText(
    row?.playerId ||
      row?.id ||
      row?.player?.id ||
      row?.player?.playerId ||
      ''
  )
}

const buildById = rows => {
  return rows.reduce((acc, row) => {
    const id = getPlayerId(row)

    if (id) {
      acc[id] = row
    }

    return acc
  }, {})
}

export const buildTeamPlayersBase = ({ team, games } = {}) => {
  const model = resolveTeamPlayers({
    team,
    games: Array.isArray(games) ? games : emptyArray,
  })

  const rows = Array.isArray(model?.rows)
    ? model.rows
    : emptyArray

  const summary = model?.summary || {}

  return {
    rows,
    summary,
    byId: buildById(rows),

    counts: {
      players: rows.length,
    },
  }
}
