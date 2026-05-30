// src/ui/forms/gameStatsForm/logic/players.logic.js

import {
  getPlayerId,
  getPlayerName,
  isPlayerInSquad,
  isPlayerStarting,
  toNumber,
} from './core/form.helpers.js'

export const MIN_STATS_MINUTES = 15

const getGameDuration = game => {
  return toNumber(game?.gameDuration) || 80
}

const getPlayerMinutes = ({ player, game }) => {
  return toNumber(player?.timePlayed) || getGameDuration(game)
}

const findStatsRow = ({ rows, playerId }) => {
  return rows.find(row => row.playerId === playerId) || null
}

export const resetPlayerStatsRow = ({ draft, playerId, game, team }) => {
  const players = Array.isArray(draft?.players) ? draft.players : []
  const rows = Array.isArray(draft?.playerStats) ? draft.playerStats : []
  const player = players.find(item => item.playerId === playerId)

  if (!player) return rows

  return rows.map(row => {
    if (row.playerId !== playerId) return row

    return buildPlayerStatsRow({
      player,
      game,
      team,
      currentRow: null,
    })
  })
}

export const isStatsEligiblePlayer = player => {
  return toNumber(player?.timePlayed) >= MIN_STATS_MINUTES
}

export const sortGameStatsPlayers = players => {
  return [...(players || [])].sort((a, b) => {
    if (a.isStarting !== b.isStarting) {
      return a.isStarting ? -1 : 1
    }

    return toNumber(b.timePlayed) - toNumber(a.timePlayed)
  })
}

export const buildGameStatsPlayers = game => {
  const players = Array.isArray(game?.gamePlayers) ? game.gamePlayers : []

  const rows = players
    .map(player => {
      const playerId = getPlayerId(player)
      if (!playerId) return null

      return {
        id: playerId,
        playerId,
        name: getPlayerName(player),
        photo: player?.photo || '',
        position: player?.position || player?.primaryPosition || '',
        isStarting: isPlayerStarting(player),
        onSquad: isPlayerInSquad(player),
        timePlayed: toNumber(player?.timePlayed),
        goals: toNumber(player?.goals),
        assists: toNumber(player?.assists),
      }
    })
    .filter(Boolean)

  return sortGameStatsPlayers(rows)
}

export const buildPlayerStatsRow = ({ player, game, team, currentRow = null }) => {
  const playerId = player?.playerId || player?.id || currentRow?.playerId || ''
  const timePlayed = getPlayerMinutes({ player, game })

  return {
    ...(currentRow || {}),

    playerId,
    gameId: game?.id || currentRow?.gameId || '',
    teamId: team?.id || game?.teamId || currentRow?.teamId || '',

    isSelected: true,
    isStarting: Boolean(player?.isStarting),
    position: player?.position || currentRow?.position || '',

    timePlayed,
    timeVideoStats: timePlayed,

    goals: toNumber(player?.goals),
    assists: toNumber(player?.assists),
  }
}

export const getDefaultSelectedPlayerIds = players => {
  return players
    .filter(isStatsEligiblePlayer)
    .map(player => player.playerId)
}

export const syncSelectedPlayersStatsRows = ({ draft, selectedPlayerIds, game, team }) => {
  const players = Array.isArray(draft?.players) ? draft.players : []
  const rows = Array.isArray(draft?.playerStats) ? draft.playerStats : []
  const selected = new Set(selectedPlayerIds || [])

  return players
    .filter(player => selected.has(player.playerId))
    .map(player => {
      return buildPlayerStatsRow({
        player,
        game,
        team,
        currentRow: findStatsRow({ rows, playerId: player.playerId }),
      })
    })
}

export const createPlayerStatsRows = ({ players, selectedPlayerIds, game, team }) => {
  return syncSelectedPlayersStatsRows({
    draft: {
      players,
      playerStats: [],
    },
    selectedPlayerIds,
    game,
    team,
  })
}

export const togglePlayerId = ({ selectedPlayerIds, playerId }) => {
  const current = Array.isArray(selectedPlayerIds) ? selectedPlayerIds : []

  if (current.includes(playerId)) {
    return current.filter(id => id !== playerId)
  }

  return [...current, playerId]
}
