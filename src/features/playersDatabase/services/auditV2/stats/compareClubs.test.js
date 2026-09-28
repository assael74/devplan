import {
  compareStatsClubsV2,
} from './compareClubs.js'

const expected = [{
  clubId: 'club-1',
  ageGroupId: 'u15',
  seasonKey: '26_27',
  teamId: 'team-1',
  season: {
    seasonKey: '26_27',
    teamId: 'team-1',
    playersCount: 18,
    scoutProfilesSummary: {
      total: 4,
    },
  },
}]

describe('Stats Audit V2 Clubs', () => {
  test('compares only the expected canonical age-group season slice', () => {
    expect(compareStatsClubsV2({
      expectedClubs: expected,
      actual: {
        clubs: [{
          clubId: 'club-1',
          club: {
            ageGroups: [{
              ageGroupId: 'u15',
              seasons: [{
                ...expected[0].season,
                unrelatedField: 'preserved',
              }],
            }],
            competitionPaths: [{
              birthYear: 2012,
              unrelated: true,
            }],
          },
        }],
        clubsMaster: {
          clubs: [{
            clubId: 'club-1',
            competitionPaths: [{
              unrelated: true,
            }],
            ageGroups: [{
              ageGroupId: 'u15',
              current: [{
                ...expected[0].season,
                masterOnlyField: 'preserved',
              }],
              previous: [],
            }],
          }, {
            clubId: 'other-club',
            ageGroups: [],
          }],
        },
      },
    })).toEqual({
      clubFindings: [],
      masterFindings: [],
    })
  })

  test('reports a missing scoped Club season', () => {
    const result = compareStatsClubsV2({
      expectedClubs: expected,
      actual: {
        clubs: [{
          clubId: 'club-1',
          club: {
            ageGroups: [],
          },
        }],
        clubsMaster: {
          clubs: [],
        },
      },
    })

    expect(result.clubFindings).toEqual([
      expect.objectContaining({
        type: 'missing_projection',
        target: 'club',
      }),
    ])
    expect(result.masterFindings).toEqual([
      expect.objectContaining({
        type: 'missing_projection',
        target: 'clubsMaster',
      }),
    ])
  })
})

test('Clubs Master compares its compact writer contract and ignores Club-only fields', () => {
  const compactExpected = [{
    clubId: 'club-1',
    ageGroupId: 'u15',
    seasonKey: '26_27',
    teamId: 'team-1',
    season: {
      seasonKey: '26_27',
      teamId: 'team-1',
      region: 'north',
      performance: {
        tableRank: 2,
        tableAttackRank: 1,
        tableDefenseRank: 3,
        points: 12,
      },
      updatedAt: 'writer-only-club-value',
    },
    masterSeason: {
      seasonKey: '26_27',
      teamId: 'team-1',
      performance: {
        tableRank: 2,
        points: 12,
      },
    },
  }]

  const result = compareStatsClubsV2({
    expectedClubs: compactExpected,
    actual: {
      clubs: [{
        clubId: 'club-1',
        club: {
          ageGroups: [{
            ageGroupId: 'u15',
            seasons: [compactExpected[0].season],
          }],
        },
      }],
      clubsMaster: {
        clubs: [{
          clubId: 'club-1',
          ageGroups: [{
            ageGroupId: 'u15',
            current: [compactExpected[0].masterSeason],
            previous: [],
          }],
        }],
      },
    },
  })

  expect(result.clubFindings).toEqual([])
  expect(result.masterFindings).toEqual([])
})
