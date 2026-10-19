// src/features/playersDatabase/domain/stats/statsLoadState.js

export const readStatsGameCount = value => {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (String(value).trim() === '') return null
  const count = Number(value)
  return Number.isInteger(count) && count >= 0 ? count : null
}

export const buildLeagueStatsProjection = (teamSeason = {}) => {
  const stats = teamSeason.stats || {}
  const state = stats.statsLoadState || {}
  const loaded = String(state.status || '').trim() === 'loaded'

  return {
    hasStats: Object.values(stats.playersById || {}).some(player => String(player?.statsStatus || '').trim() === 'loaded'),
    statsComplete: loaded,
    loadedAt: loaded ? state.updatedAt || null : null,
    teamGamePlayedAtLoad: loaded ? readStatsGameCount(state.teamGamePlayedAtLoad) : null,
  }
}
