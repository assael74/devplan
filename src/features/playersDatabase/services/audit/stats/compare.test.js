// src/features/playersDatabase/services/audit/stats/compare.test.js

import { compareStatsAudit } from './compare.js'

const timestamp = (seconds, nanoseconds = 0) => ({ seconds, nanoseconds })

const base = ({ expectedUpdatedAt, actualUpdatedAt }) => ({
  actual: {
    teamSeason: {
      identity: { teamId: 'club_2011_1', leagueId: 'league-1', clubId: 'club', seasonId: '2026_2027' },
    },
    playerRootsById: {},
    playerSeasonsById: {},
    playerSearchIndexesById: {},
    counterpartTeamSeasonsById: {},
    league: {
      id: 'league-1',
      seasonsById: {
        '2026_2027': { table: { teamsById: { club_2011_1: { stats: { b: 2, a: 1, updatedAt: actualUpdatedAt }, scouting: {} } } } },
      },
    },
    leaguesCenter: { leaguesById: { 'league-1': { seasonsById: { '2026_2027': { teamsById: { club_2011_1: {} } } } } } },
    clubsCenter: { clubsById: { club: { teamsById: { club_2011_1: {} } } } },
  },
  expectedState: {
    complete: true,
    expected: {
      playerRootPlans: [],
      playerSeasonsById: {},
      playerSearchIndexesById: {},
      counterpartPatches: [],
      leagueTeamPatch: { stats: { a: 1, b: 2, updatedAt: expectedUpdatedAt }, scouting: {} },
      leaguesCenterTeam: {},
      clubsCenterTeam: {},
    },
  },
  approvedState: null,
  seasonId: '2026_2027',
})

describe('compareStatsAudit', () => {
  test('normalizes object key order and Firestore timestamp representations', () => {
    const args = base({
      expectedUpdatedAt: { _seconds: 100, _nanoseconds: 500000000 },
      actualUpdatedAt: timestamp(100, 500000000),
    })
    expect(compareStatsAudit(args)).toEqual([])
  })

  test('reports a counterpart movement that was not persisted', () => {
    const args = base({ expectedUpdatedAt: null, actualUpdatedAt: null })
    args.expectedState.expected.counterpartPatches = [{
      documentId: 'counterpart__2026_2027',
      movement: { transfersInById: { movement_1: { playerId: 'player-1' } } },
    }]
    args.actual.counterpartTeamSeasonsById = {
      'counterpart__2026_2027': { movement: { transfersInById: {} } },
    }

    expect(compareStatsAudit(args)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        target: 'counterpartTeamSeason',
        documentId: 'counterpart__2026_2027',
        field: 'movement',
      }),
    ]))
  })
})
