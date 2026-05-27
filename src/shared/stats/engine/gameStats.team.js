// src/shared/stats/engine/gameStats.team.js

import { n } from '../stats.helpers.js'
import { applyStatsRates } from './gameStats.rates.js'

const SKIP_NUMERIC_KEYS = new Set([
  'id',
  'uid',
  'name',
  'playerId',
  'teamId',
  'gameId',
  'position',

  // זמן משחק / וידאו בקבוצה לא נספר לפי שחקנים
  'timePlayed',
  'timeVideoStats',
  'gameDuration',
  'totalGameTime',
])

const addNumeric = (target, row = {}) => {
  for (const [key, value] of Object.entries(row)) {
    if (SKIP_NUMERIC_KEYS.has(key)) continue
    if (typeof value === 'boolean') continue

    const num = n(value)
    if (!Number.isFinite(num)) continue

    target[key] = n(target[key]) + num
  }
}

const resolveTeamGameTime = ({ rows, context, key, fallbackKeys = [] }) => {
  const direct = n(context?.[key])
  if (direct > 0) return direct

  for (const fallbackKey of fallbackKeys) {
    const fallback = n(context?.[fallbackKey])
    if (fallback > 0) return fallback
  }

  const rowValues = rows
    .map(row => n(row?.[key]))
    .filter(value => value > 0)

  if (!rowValues.length) return 0

  return Math.max(...rowValues)
}

export function buildGameTeamStats(playerStats = [], context = {}) {
  const rows = Array.isArray(playerStats) ? playerStats : []

  const timePlayed = resolveTeamGameTime({
    rows,
    context,
    key: 'timePlayed',
    fallbackKeys: ['gameDuration', 'duration'],
  })

  const timeVideoStats = resolveTeamGameTime({
    rows,
    context,
    key: 'timeVideoStats',
    fallbackKeys: ['teamVideoTime', 'videoDuration', 'gameDuration', 'duration'],
  })

  const teamStats = {
    gameId: context.gameId || '',
    teamId: context.teamId || '',
    playersCount: rows.length,

    timePlayed,
    timeVideoStats,
  }

  for (const row of rows) addNumeric(teamStats, row)

  return applyStatsRates(teamStats)
}
