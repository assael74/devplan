// src/features/playersDatabase/domain/stats/statsLoadState.test.js

import { buildLeagueStatsProjection, readStatsGameCount } from './statsLoadState.js'

test.each([0, 8, '10'])('accepts a known non-negative game count %p', value => {
  expect(readStatsGameCount(value)).toBe(Number(value))
})

test.each([null, undefined, '', ' ', true, false, [], {}, -1, 1.5, 'unknown'])('keeps invalid or unknown game counts unknown: %p', value => {
  expect(readStatsGameCount(value)).toBeNull()
})

test('projects only the Stats-owned snapshot, never the current table or player games', () => {
  const teamSeason = {
    competitionSnapshot: { officialTable: { teamGamePlayed: 12 } },
    stats: {
      statsLoadState: { status: 'loaded', updatedAt: 'original-load', teamGamePlayedAtLoad: 8 },
      playersById: { p1: { statsStatus: 'loaded', playerStats: { teamGamePlayed: 6 } } },
    },
  }
  expect(buildLeagueStatsProjection(teamSeason)).toEqual({
    hasStats: true, statsComplete: true, loadedAt: 'original-load', teamGamePlayedAtLoad: 8,
  })
  delete teamSeason.stats.statsLoadState.teamGamePlayedAtLoad
  expect(buildLeagueStatsProjection(teamSeason).teamGamePlayedAtLoad).toBeNull()
})

test('missing Stats reset the projected snapshot and load time', () => {
  expect(buildLeagueStatsProjection({ stats: { statsLoadState: {
    status: 'missing', updatedAt: 'clear-time', teamGamePlayedAtLoad: 8,
  } } })).toEqual({ hasStats: false, statsComplete: false, loadedAt: null, teamGamePlayedAtLoad: null })
})
