// src/features/playersDatabase/domain/movement/arrivalHistory.projection.test.js

import { buildArrivalHistory } from './arrivalHistory.projection.js'

const source = {
  identity: {
    teamId: 'team-a',
    seasonId: '2025_2026',
    teamSeasonDocumentId: 'team-a__2025_2026',
  },
  roster: { playersById: { p1: {} } },
  stats: { playersById: { p1: { lineClassification: { line: 'ATTACK' } } } },
  scouting: { playersById: { p1: {
    primary: { profileId: 'clear_scorer', strengthDepthPct: 83 },
    professionalProfileIds: ['clear_scorer'],
    profileDepthsById: { clear_scorer: 83 },
  } } },
  timestamps: { updatedAt: '2026-06-01' },
}

const input = {
  movementId: 'move-1',
  playerId: 'p1',
  fromTeamId: 'team-a',
  seasonId: '2026_2027',
  updatedAt: '2026-08-01',
}

test('copies previous-season scout and line from the canonical source', () => {
  expect(buildArrivalHistory({ ...input, sourceTeamSeason: source })).toMatchObject({
    sourceTeamSeasonDocumentId: 'team-a__2025_2026',
    sourceStatus: 'available',
    scoutStatus: 'available',
    primaryProfileId: 'clear_scorer',
    lineStatus: 'available',
    line: 'ATTACK',
  })
})

test('distinguishes unavailable source from a player with no profile or line', () => {
  const missing = buildArrivalHistory(input)
  expect(missing).toMatchObject({ sourceStatus: 'missing', scoutStatus: 'unknown', lineStatus: 'unknown' })
  const withoutProfile = buildArrivalHistory({
    ...input,
    sourceTeamSeason: {
      ...source,
      stats: { playersById: {} },
      scouting: { playersById: {} },
    },
  })
  expect(withoutProfile).toMatchObject({ sourceStatus: 'available', scoutStatus: 'none', lineStatus: 'none' })
})
