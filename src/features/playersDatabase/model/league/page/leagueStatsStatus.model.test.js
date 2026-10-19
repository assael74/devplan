// src/features/playersDatabase/model/league/page/leagueStatsStatus.model.test.js

import { buildLeagueStatsStatus } from './leagueStatsStatus.model.js'

const loaded = { hasStats: true, statsComplete: true, teamGamePlayedAtLoad: 8 }

test.each([
  [{}, 10, 'missing', null],
  [loaded, 8, 'matched', 0],
  [loaded, 10, 'gap', 2],
  [loaded, 7, 'mismatch', -1],
  [{ hasStats: true }, 10, 'unknown', null],
  [loaded, null, 'unknown', null],
  [{ ...loaded, statsComplete: false }, 8, 'partial', 0],
  [{ ...loaded, teamGamePlayedAtLoad: 0 }, 0, 'matched', 0],
])('reports Stats coverage and game context without inventing a baseline', (stats, teamGamePlayed, state, gap) => {
  expect(buildLeagueStatsStatus({ stats, teamGamePlayed })).toMatchObject({ state, gap })
})

test('dates do not turn an unknown baseline into a current Stats result', () => {
  expect(buildLeagueStatsStatus({
    stats: { hasStats: true, statsComplete: true, loadedAt: '2099-01-01T00:00:00Z' },
    teamGamePlayed: 10,
  }).state).toBe('unknown')
})

test('describes exactly one additional game in the table', () => {
  expect(buildLeagueStatsStatus({ stats: loaded, teamGamePlayed: 9 }).label).toBe('פער משחק אחד')
})
