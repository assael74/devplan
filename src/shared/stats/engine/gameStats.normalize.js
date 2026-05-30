// src/shared/stats/engine/gameStats.normalize.js

import { statsParm } from '../statsParmList.js'
import { n, safe } from '../stats.helpers.js'
import { applyStatsRates } from './gameStats.rates.js'

export const EXCLUDED_FORM_PARM_IDS = new Set([
  'isStarting',
  'goals',
  'assists',
  'position',
])

const SYSTEM_KEYS = new Set([
  'id',
  'uid',
  'name',
  'playerId',
  'teamId',
  'gameId',
  'gameStatsDocId',
])

const fieldTypeById = new Map(
  (statsParm || []).map(item => [item.id, item.statsParmFieldType])
)

const cleanId = value => {
  return safe(value).trim()
}

const isObject = value => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const isEmptyValue = value => {
  return value === null || value === undefined || value === ''
}

const isExcludedKey = key => {
  return EXCLUDED_FORM_PARM_IDS.has(key)
}

const normalizeValue = (key, value) => {
  const type = fieldTypeById.get(key)

  if (type === 'number' || type === 'triplet') return n(value)
  if (type === 'boolean') return Boolean(value)

  return value ?? ''
}

const shouldKeepNumber = value => {
  return n(value) > 0
}

const shouldKeepTripletValue = value => {
  return n(value) > 0
}

const shouldKeepValue = (key, value) => {
  if (SYSTEM_KEYS.has(key)) return true
  if (isExcludedKey(key)) return false
  if (isEmptyValue(value)) return false

  const type = fieldTypeById.get(key)

  if (type === 'number') return shouldKeepNumber(value)
  if (type === 'triplet') return shouldKeepTripletValue(value)
  if (type === 'boolean') return Boolean(value)

  return String(value).trim() !== ''
}

const flattenStatsRow = row => {
  const stats = isObject(row?.stats) ? row.stats : {}

  return {
    ...(row || {}),
    ...stats,
    stats: undefined,
    completeness: undefined,
  }
}

const hasAdvancedStatsValues = row => {
  return Object.entries(row || {}).some(([key, value]) => {
    if (SYSTEM_KEYS.has(key)) return false
    if (EXCLUDED_FORM_PARM_IDS.has(key)) return false
    if (isEmptyValue(value)) return false

    const num = Number(value)

    if (Number.isFinite(num)) return num > 0
    if (typeof value === 'boolean') return value === true

    return String(value).trim() !== ''
  })
}

export function normalizeGamePlayerStats(row = {}, context = {}) {
  const flat = flattenStatsRow(row)

  const base = {
    ...flat,
    playerId: cleanId(flat.playerId || flat.id),
    gameId: cleanId(flat.gameId || context.gameId),
    gameStatsDocId: cleanId(flat.gameStatsDocId || context.gameStatsDocId),
    teamId: cleanId(flat.teamId || context.teamId),
  }

  const next = {}

  for (const [key, value] of Object.entries(base)) {
    if (!shouldKeepValue(key, value)) continue

    next[key] = normalizeValue(key, value)
  }

  return applyStatsRates(next)
}

export function normalizeGamePlayerStatsList(playerStats = [], context = {}) {
  return (Array.isArray(playerStats) ? playerStats : [])
    .map(row => normalizeGamePlayerStats(row, context))
    .filter(row => row.playerId)
    .filter(hasAdvancedStatsValues)
}
