// src/features/bulkActions/players/delete/logic/buildPlayersDeleteSummary.js

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function getPlayerData(player = {}) {
  return player?.player || player
}

function hasPhoto(player = {}) {
  const data = getPlayerData(player)
  return Boolean(data?.photo)
}

function hasParents(player = {}) {
  const data = getPlayerData(player)
  return Array.isArray(data?.parents) ? data.parents.length > 0 : Boolean(data?.parents)
}

function hasAbilities(player = {}) {
  const data = getPlayerData(player)

  return Boolean(
    data?.abilities ||
    data?.formIds?.length ||
    data?.level ||
    data?.levelPotential
  )
}

function hasStats(player = {}) {
  const data = getPlayerData(player)

  return Boolean(
    data?.stats ||
    data?.hasStats ||
    data?.gamesCount ||
    data?.minutes
  )
}

export function buildPlayersDeleteSummary(players = []) {
  return asArray(players).reduce(
    (summary, player) => {
      summary.totalPlayers += 1

      if (hasPhoto(player)) summary.withPhoto += 1
      if (hasParents(player)) summary.withParents += 1
      if (hasAbilities(player)) summary.withAbilities += 1
      if (hasStats(player)) summary.withStats += 1

      return summary
    },
    {
      totalPlayers: 0,
      withPhoto: 0,
      withParents: 0,
      withAbilities: 0,
      withStats: 0,
    }
  )
}
