import { normalizePlayerStats as normalizeSharedPlayerStats } from '@devplan/players-scout-engine/players/index.js'

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

export const normalizePlayerStats = normalizeSharedPlayerStats
