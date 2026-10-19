// src/features/playersDatabase/services/write/stats/writeStatsLeagueProjection.test.js

import { setDoc } from 'firebase/firestore'
import { writeStatsLeagueProjection } from './writeStatsLeagueProjection.js'

jest.mock('firebase/firestore', () => ({
  FieldPath: class { constructor(...segments) { this.segments = segments } },
  doc: (_db, collection, id) => ({ path: `${collection}/${id}` }),
  setDoc: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))

test('Stats updates the owned scouting count without replacing retained legacy signals', async () => {
  const teamId = 'club_2012_1'
  const seasonId = '2026_2027'
  const oldSignals = { offense: true, defense: false, updatedAt: 'old' }
  const current = { seasonsById: { [seasonId]: { table: { teamsById: {
    [teamId]: { scouting: { teamTaskSignals: oldSignals, playersWithScoutProfileCount: 2 } },
    unrelated: { scouting: { playersWithScoutProfileCount: 7 } },
  } } } } }
  await writeStatsLeagueProjection({ approvedState: { leagueProjection: {
    leagueId: 'league', seasonId, teamId,
    patch: { stats: { hasStats: true, statsComplete: true, loadedAt: 'new', teamGamePlayedAtLoad: 8 }, scouting: { playersWithScoutProfileCount: 3 }, updatedAt: 'new' },
  } } })
  const [, patch, options] = setDoc.mock.calls[0]
  for (const field of options.mergeFields) {
    const parts = field.segments
    const value = parts.reduce((cursor, key) => cursor[key], patch)
    const owner = parts.slice(0, -1).reduce((cursor, key) => {
      if (!cursor[key]) cursor[key] = {}
      return cursor[key]
    }, current)
    owner[parts.at(-1)] = value
  }
  const teams = current.seasonsById[seasonId].table.teamsById
  expect(teams[teamId].stats.teamGamePlayedAtLoad).toBe(8)
  expect(teams[teamId].scouting.playersWithScoutProfileCount).toBe(3)
  expect(teams[teamId].scouting.teamTaskSignals).toBe(oldSignals)
  expect(teams.unrelated.scouting.playersWithScoutProfileCount).toBe(7)
})
