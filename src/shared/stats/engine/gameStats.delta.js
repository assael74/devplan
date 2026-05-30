// src/shared/stats/engine/gameStats.delta.js

import { n } from '../stats.helpers.js'

const SKIP_DELTA_KEYS = new Set([
  'id',
  'uid',
  'name',

  'playerId',
  'teamId',
  'gameId',
  'gameStatsDocId',

  'position',
  'isStarting',
  'goals',
  'assists',

  'playersCount',
])

const isRateKey = key => {
  return String(key || '').endsWith('Rate')
}

const isNumericValue = value => {
  if (typeof value === 'boolean') return false

  const num = Number(value)

  return Number.isFinite(num)
}

const collectNumericKeys = (...items) => {
  const keys = new Set()

  for (const item of items) {
    if (!item || typeof item !== 'object') continue

    for (const [key, value] of Object.entries(item)) {
      if (SKIP_DELTA_KEYS.has(key)) continue
      if (isRateKey(key)) continue
      if (isNumericValue(value)) keys.add(key)
    }
  }

  return Array.from(keys)
}

export function buildStatsDelta(prev = {}, next = {}) {
  const delta = {}
  const keys = collectNumericKeys(prev, next)

  for (const key of keys) {
    const diff = n(next?.[key]) - n(prev?.[key])
    if (diff !== 0) delta[key] = diff
  }

  return delta
}

export function applyStatsDelta(target = {}, delta = {}) {
  const next = { ...(target || {}) }

  for (const [key, value] of Object.entries(delta || {})) {
    const nextValue = n(next[key]) + n(value)

    if (nextValue === 0) {
      delete next[key]
      continue
    }

    next[key] = nextValue
  }

  return next
}

export function indexPlayerStatsByPlayerId(playerStats = []) {
  const map = new Map()

  for (const row of Array.isArray(playerStats) ? playerStats : []) {
    const playerId = String(row?.playerId || row?.id || '').trim()
    if (playerId) map.set(playerId, row)
  }

  return map
}

export function getMergedPlayerIds(prevPlayerStats = [], nextPlayerStats = []) {
  const ids = new Set()

  for (const row of Array.isArray(prevPlayerStats) ? prevPlayerStats : []) {
    const playerId = String(row?.playerId || row?.id || '').trim()
    if (playerId) ids.add(playerId)
  }

  for (const row of Array.isArray(nextPlayerStats) ? nextPlayerStats : []) {
    const playerId = String(row?.playerId || row?.id || '').trim()
    if (playerId) ids.add(playerId)
  }

  return Array.from(ids)
}
