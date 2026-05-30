// src/shared/stats/engine/gameStats.aggregate.js

import { n } from '../stats.helpers.js'
import { applyStatsRates } from './gameStats.rates.js'
import { upsertStatsGameRef } from './gameStats.refs.js'

const SKIP_AGG_KEYS = new Set([
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

const isSkippableValue = value => {
  if (typeof value === 'boolean') return true
  if (value === null || value === undefined || value === '') return true

  const num = Number(value)

  return !Number.isFinite(num) || num === 0
}

const addStatsValues = (target, stats = {}) => {
  for (const [key, value] of Object.entries(stats)) {
    if (SKIP_AGG_KEYS.has(key)) continue
    if (isSkippableValue(value)) continue

    target[key] = n(target[key]) + n(value)
  }
}

export function buildNextPlayerStatsItem({
  current,
  playerStats,
  gameRef,
  now,
}) {
  const next = {
    ...(current || {}),
    id: playerStats.playerId,
    playerId: playerStats.playerId,
    teamId: playerStats.teamId || current?.teamId || '',
    statsGameRefs: upsertStatsGameRef(current?.statsGameRefs, gameRef),
    gamesWithStats: n(current?.gamesWithStats) + 1,
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }

  addStatsValues(next, playerStats)

  return applyStatsRates(next)
}

export function buildNextTeamStatsItem({
  current,
  teamStats,
  gameRef,
  now,
}) {
  const next = {
    ...(current || {}),
    id: teamStats.teamId,
    teamId: teamStats.teamId,
    statsGameRefs: upsertStatsGameRef(current?.statsGameRefs, gameRef),
    gamesWithStats: n(current?.gamesWithStats) + 1,
    playersWithStats: n(current?.playersWithStats) + n(teamStats.playersCount),
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }

  addStatsValues(next, teamStats)

  return applyStatsRates(next)
}
