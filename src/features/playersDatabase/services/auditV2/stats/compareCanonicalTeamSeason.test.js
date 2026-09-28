import { compareStatsCanonicalTeamSeasonV2 } from './compareCanonicalTeamSeason.js'

describe('compareStatsCanonicalTeamSeasonV2', () => {
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
