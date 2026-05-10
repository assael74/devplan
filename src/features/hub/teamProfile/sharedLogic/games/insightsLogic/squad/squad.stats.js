// teamProfile/sharedLogic/games/insightsLogic/squad/squad.stats.js

import { toNum } from '../common/view.shared.js'

import {
  getGamePlayerId,
  getGamePlayers,
  isStarter,
  isUsedPlayer,
} from './squad.gamePlayers.js'

import { getPlayerName } from './squad.players.js'

export const createEmptyPlayerStat = (playerId) => {
  return {
    playerId,
    goals: 0,
    assists: 0,
    starts: 0,
    appearances: 0,
    selectedGames: 0,
    squadGames: 0,
    timePlayed: 0,
  }
}

export const collectPlayerStats = (playedRows = []) => {
  const statsByPlayerId = {}

  playedRows.forEach((row) => {
    const gamePlayers = getGamePlayers(row)

    gamePlayers.forEach((item) => {
      const playerId = getGamePlayerId(item)
      if (!playerId) return

      if (!statsByPlayerId[playerId]) {
        statsByPlayerId[playerId] = createEmptyPlayerStat(playerId)
      }

      const stat = statsByPlayerId[playerId]
      const goals = toNum(item?.goals)
      const assists = toNum(item?.assists)
      const timePlayed = toNum(item?.timePlayed ?? item?.minutes ?? item?.playedMinutes)

      stat.goals += goals
      stat.assists += assists
      stat.timePlayed += timePlayed

      if (isStarter(item)) stat.starts += 1
      if (isUsedPlayer(item)) stat.appearances += 1
      if (item?.isSelected === true) stat.selectedGames += 1
      if (item?.onSquad === true) stat.squadGames += 1
    })
  })

  return statsByPlayerId
}

export const enrichPlayerStat = (stat, playersMap = {}) => {
  const player = playersMap?.[stat.playerId] || {}

  return {
    ...stat,
    playerName: getPlayerName(player, stat.playerId),
    photo: player?.photo || '',
    positions: Array.isArray(player?.positions) ? player.positions : [],
    squadRole: player?.squadRole || '',
    rawPlayer: player,
  }
}

export const sortByStat = (items = [], key) => {
  return [...items].sort((a, b) => {
    const diff = toNum(b[key]) - toNum(a[key])
    if (diff !== 0) return diff

    return String(a?.playerName || '').localeCompare(String(b?.playerName || ''))
  })
}
