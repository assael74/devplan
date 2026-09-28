import {
  buildStatsCanonicalPlayerDocumentProjection,
} from './playerDocumentCanonical.projection.js'

describe('Stats canonical Player Document projection', () => {
  test('takes League-owned season identity from canonical League context', () => {
    const result = buildStatsCanonicalPlayerDocumentProjection({
      player: {
        playerDocumentId: 'player-1',
        statsStatus: 'loaded',
        birthYear: 2012,
        playerStats: {},
      },
      teamRoot: {
        id: 'team-doc-1',
        clubId: 'club-1',
        ageGroupId: 'u13',
        leagueLevel: 9,
      },
      teamSeason: {
        seasonId: '28',
        seasonKey: '26_27',
        leagueId: 'league-1',
        ageGroupId: 'u15',
        leagueName: '',
        leagueLevel: 2,
      },
      league: {
        id: 'league-1',
        name: 'Canonical League',
        current: {
          seasonId: '28',
          seasonKey: '26_27',
          seasonStatus: 'active',
          ageGroupId: 'u13',
          leagueLevel: 4,
        },
      },
      seasonKey: '26_27',
      leagueId: 'league-1',
      birthTeamDocumentId: 'team-doc-1',
    })

    expect(result.seasonRow).toEqual(expect.objectContaining({
      leagueName: 'Canonical League',
      ageGroupId: 'u13',
      leagueLevel: 4,
    }))
  })
  test('preserves canonical birthYear and does not coerce a missing value to zero', () => {
    const present = buildStatsCanonicalPlayerDocumentProjection({
      player: { playerId: 'p1', birthYear: 2012, scoutProfiles: [] },
      teamRoot: { id: 'team-1' },
      teamSeason: { seasonKey: '26_27' },
      league: { current: { seasonKey: '26_27', seasonStatus: 'active' } },
      seasonKey: '26_27',
      birthTeamDocumentId: 'team-1',
    })
    const missing = buildStatsCanonicalPlayerDocumentProjection({
      player: { playerId: 'p1', scoutProfiles: [] },
      teamRoot: { id: 'team-1' },
      teamSeason: { seasonKey: '26_27' },
      league: { current: { seasonKey: '26_27', seasonStatus: 'active' } },
      seasonKey: '26_27',
      birthTeamDocumentId: 'team-1',
    })

    expect(present.seasonRow.birthYear).toBe(2012)
    expect(missing.seasonRow.birthYear).toBeNull()
  })

})
