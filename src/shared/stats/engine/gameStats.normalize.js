// src/shared/stats/engine/gameStats.normalize.js

import { statsParm } from '../statsParmList.js'
import { n, safe } from '../stats.helpers.js'
import { applyStatsRates } from './gameStats.rates.js'

const fieldTypeById = new Map((statsParm || []).map(item => [item.id, item.statsParmFieldType]))

const cleanId = value => safe(value).trim()

const normalizeValue = (key, value) => {
  const type = fieldTypeById.get(key)

  if (type === 'number' || type === 'triplet') return n(value)
  if (type === 'boolean') return Boolean(value)

  return value ?? ''
}

export function normalizeGamePlayerStats(row = {}, context = {}) {
  const base = {
    ...row,
    playerId: cleanId(row.playerId || row.id),
    gameId: cleanId(row.gameId || context.gameId),
    teamId: cleanId(row.teamId || context.teamId),
  }

  const next = {}

  for (const [key, value] of Object.entries(base)) {
    if (value == null || value === '') continue
    next[key] = normalizeValue(key, value)
  }

  return applyStatsRates(next)
}

export function normalizeGamePlayerStatsList(playerStats = [], context = {}) {
  return (Array.isArray(playerStats) ? playerStats : [])
    .map(row => normalizeGamePlayerStats(row, context))
    .filter(row => row.playerId)
}
