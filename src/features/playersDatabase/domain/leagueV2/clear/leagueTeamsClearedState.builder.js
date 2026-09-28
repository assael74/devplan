// src/features/playersDatabase/domain/leagueV2/clear/leagueTeamsClearedState.builder.js

import { normalizeSeasonLookupKey } from '../../../model/shared/season.model.js'

export const sameSeason = (left, right) => Boolean(
  normalizeSeasonLookupKey(left) &&
  normalizeSeasonLookupKey(left) === normalizeSeasonLookupKey(right)
)

export const failClearLeague = (code, message, details = null) => {
  const error = new Error(message)
  error.code = code
  error.details = details
  throw error
}

export const assertDocumentId = id => {
  if (typeof id !== 'string' || !id.trim() || id.includes('/') || ['.', '..'].includes(id)) {
    failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Invalid document identity')
  }
  return id
}

export const cloneValue = value => {
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value.getTime())
  if (typeof value.toMillis === 'function') return new value.constructor(value.seconds, value.nanoseconds)
  if (Array.isArray(value)) return value.map(cloneValue)
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]))
}

const sorted = value => {
  if (Array.isArray(value)) return value.map(sorted)
  if (value && typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.toISOString()
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])]))
}

export const sameValue = (left, right) => JSON.stringify(sorted(left)) === JSON.stringify(sorted(right))

export const selectLeagueSeason = (league, seasonKey) => {
  const candidates = []
  if (league.current && sameSeason(league.current.seasonKey, seasonKey)) {
    candidates.push({ field: 'current', index: null, season: league.current })
  }
  ;(league.history || []).forEach((season, index) => {
    if (sameSeason(season.seasonKey, seasonKey)) candidates.push({ field: 'history', index, season })
  })
  if (candidates.length !== 1) failClearLeague('CLEAR_LEAGUE_IDENTITY', 'Missing or ambiguous League season')
  return candidates[0]
}

// Absence is current state, not evidence that Clear was executed.
export const getLeagueTeamsState = season => season?.tableRank === null ? 'absent' : 'present'

// Same table-owned representation as buildSeasonDoc: no calculated context.
// Replace the selected season as a whole so the old context is actually removed.
export const buildLeagueTeamsClearedState = season => {
  const next = cloneValue(season)
  next.tableRank = null
  delete next.teamPerformanceContext
  return next
}
