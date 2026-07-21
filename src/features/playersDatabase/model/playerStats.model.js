// features/playersDatabase/model/playerStats.model.js

import {
  hasValue,
  toNumberOrZero,
} from './value.model.js'

const resolveStatValue = ({ stats = {}, source = {}, key, legacyKeys = [] }) => {
  if (hasValue(stats[key])) return stats[key]
  if (hasValue(source[key])) return source[key]

  for (const legacyKey of legacyKeys) {
    if (hasValue(stats[legacyKey])) return stats[legacyKey]
    if (hasValue(source[legacyKey])) return source[legacyKey]
  }

  return 0
}

export const normalizePlayerStats = (player = {}) => {
  const stats = player.playerStats || {}

  return {
    games: toNumberOrZero(resolveStatValue({ stats, source: player, key: 'games' })),
    goals: toNumberOrZero(resolveStatValue({ stats, source: player, key: 'goals' })),
    yellowCards: toNumberOrZero(resolveStatValue({ stats, source: player, key: 'yellowCards' })),
    minutes: toNumberOrZero(resolveStatValue({ stats, source: player, key: 'minutes' })),
    starts: toNumberOrZero(resolveStatValue({ stats, source: player, key: 'starts' })),
    substituteIn: toNumberOrZero(resolveStatValue({
      stats,
      source: player,
      key: 'substituteIn',
      legacyKeys: ['subIn'],
    })),
    substitutedOut: toNumberOrZero(resolveStatValue({
      stats,
      source: player,
      key: 'substitutedOut',
      legacyKeys: ['subOut'],
    })),
    teamMinutes: toNumberOrZero(resolveStatValue({ stats, source: player, key: 'teamMinutes' })),
    teamGames: toNumberOrZero(resolveStatValue({ stats, source: player, key: 'teamGames' })),
  }
}
