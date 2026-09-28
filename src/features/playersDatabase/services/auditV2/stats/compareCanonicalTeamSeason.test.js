// src/features/playersDatabase/services/auditV2/stats/compareCanonicalTeamSeason.test.js

import { buildStatsAbsentTeamSeasonState } from '../../../domain/statsV2/statsAbsence.builder.js'
import { compareStatsCanonicalTeamSeasonV2 } from './compareCanonicalTeamSeason.js'

describe('compareStatsCanonicalTeamSeasonV2', () => {
  test('accepts fixed Stats absence after roster removal', () => {
    const teamSeason = buildStatsAbsentTeamSeasonState({
      teamPlayers: [{ playerId: 'p1', rosterStatus: 'regular' }],
    })
    teamSeason.teamPlayers = []

    expect(compareStatsCanonicalTeamSeasonV2({
      canonical: { teamSeason },
    })).toEqual([])
  })

  test('does not accept a missing flag with stale Balance data', () => {
    const teamSeason = buildStatsAbsentTeamSeasonState({ teamPlayers: [] })
    teamSeason.teamBalance.source.inputHash = 'old-roster-hash'

    expect(compareStatsCanonicalTeamSeasonV2({
      canonical: { teamSeason },
    })).toEqual([
      expect.objectContaining({ type: 'canonical_invariant_mismatch' }),
    ])
  })

  test('finds a loaded import whose players all remain missing', () => {
    expect(compareStatsCanonicalTeamSeasonV2({
      canonical: {
        teamSeason: {
          id: 'team-1_26-27',
          statsLoadState: { status: 'loaded' },
          teamPlayers: [
            { playerId: 'p1', statsStatus: 'missing', playerStats: {} },
            { playerId: 'p2', statsStatus: 'missing', playerStats: {} },
          ],
        },
      },
    })).toEqual([
      expect.objectContaining({
        type: 'canonical_invariant_mismatch',
        target: 'teamSeason',
        documentId: 'team-1_26-27',
      }),
    ])
  })

  test('is clean when at least one player is loaded', () => {
    expect(compareStatsCanonicalTeamSeasonV2({
      canonical: {
        teamSeason: {
          statsLoadState: { status: 'loaded' },
          teamPlayers: [{ playerId: 'p1', statsStatus: 'loaded' }],
        },
      },
    })).toEqual([])
  })
})
