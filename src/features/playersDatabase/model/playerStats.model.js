// features/playersDatabase/model/playerStats.model.js

import {
  hasValue,
  toNumberOrZero,
} from './value.model.js'

export const PLAYER_STATS_STATUS = {
  MISSING: 'missing',
  LOADED: 'loaded',
}

export const normalizePlayerStatsStatus = (
  value,
  fallback = PLAYER_STATS_STATUS.MISSING
) => (
  String(value || '').trim() === PLAYER_STATS_STATUS.LOADED
    ? PLAYER_STATS_STATUS.LOADED
    : fallback
)

const resolveStatValue = ({ stats = {}, source = {}, key, legacyKeys = [] }) => {
  if (hasValue(stats[key])) return stats[key]
  if (hasValue(source[key])) return source[key]

  for (const legacyKey of legacyKeys) {
    if (hasValue(stats[legacyKey])) return stats[legacyKey]
    if (hasValue(source[legacyKey])) return source[legacyKey]
  }

  return 0
}

const resolveOptionalStatValue = ({ stats = {}, source = {}, key }) => {
  if (hasValue(stats[key])) return stats[key]
  if (hasValue(source[key])) return source[key]

  return null
}

export const normalizePlayerStats = (player = {}) => {
  const stats = player.playerStats || {}
  const games = toNumberOrZero(resolveStatValue({ stats, source: player, key: 'games' }))
  const goals = toNumberOrZero(resolveStatValue({ stats, source: player, key: 'goals' }))
  const minutes = toNumberOrZero(resolveStatValue({ stats, source: player, key: 'minutes' }))
  const minutesPerGame = resolveOptionalStatValue({ stats, source: player, key: 'minutesPerGame' })
  const goalsPer90 = resolveOptionalStatValue({ stats, source: player, key: 'goalsPer90' })

  return {
    games,
    goals,
    yellowCards: toNumberOrZero(resolveStatValue({ stats, source: player, key: 'yellowCards' })),
    minutes,
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
    minutesPerGame: toNumberOrZero(
      hasValue(minutesPerGame) ? minutesPerGame : (games ? minutes / games : 0)
    ),
    goalsPer90: toNumberOrZero(
      hasValue(goalsPer90) ? goalsPer90 : (minutes ? (goals * 90) / minutes : 0)
    ),
  }
}
