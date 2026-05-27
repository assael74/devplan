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
  'position',
  'playersCount',
])

const addStatsValues = (target, stats = {}) => {
  for (const [key, value] of Object.entries(stats)) {
    if (SKIP_AGG_KEYS.has(key)) continue
    if (typeof value === 'boolean') continue

    const num = n(value)
    if (!Number.isFinite(num)) continue

    target[key] = n(target[key]) + num
  }
}

export function buildNextPlayerStatsItem({ current, playerStats, gameRef, now }) {
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

export function buildNextTeamStatsItem({ current, teamStats, gameRef, now }) {
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
