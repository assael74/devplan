import { buildExpectedStatsCounterpartsV2 } from './buildExpectedCounterparts.js'
import { compareStatsCounterpartsV2 } from './compareCounterparts.js'

describe('Stats Audit V2 counterpart club identity', () => {
  test('preserves the loading Club on an outgoing movement', () => {
    const [row] = buildExpectedStatsCounterpartsV2({
      canonical: {
        birthTeamDocumentId: 'team-a',
        seasonKey: '26_27',
        teamRoot: { clubId: 'club-a' },
        teamSeason: {
          transfersOut: [{
            movementId: 'm1',
            playerId: 'p1',
            toClubId: 'club-b',
            toBirthTeamDocumentId: 'team-b',
          }],
        },
      },
    })

    expect(row.fact).toEqual(expect.objectContaining({
      fromClubId: 'club-a',
      toClubId: 'club-b',
    }))
  })

  test('preserves the loading Club on an incoming movement', () => {
    const [row] = buildExpectedStatsCounterpartsV2({
      canonical: {
        birthTeamDocumentId: 'team-a',
        seasonKey: '26_27',
        teamRoot: { clubId: 'club-a' },
        teamSeason: {
          transfersIn: [{
            movementId: 'm2',
            playerId: 'p2',
            fromClubId: 'club-b',
            fromBirthTeamDocumentId: 'team-b',
          }],
        },
      },
    })

    expect(row.fact).toEqual(expect.objectContaining({
      fromClubId: 'club-b',
      toClubId: 'club-a',
    }))
  })

  test('Expected and Actual match with both Club ids preserved', () => {
    const expected = buildExpectedStatsCounterpartsV2({
      canonical: {
        birthTeamDocumentId: 'team-a',
        seasonKey: '26_27',
        teamRoot: { clubId: 'club-a' },
        teamSeason: {
          transfersOut: [{
            movementId: 'm1',
            playerId: 'p1',
            toClubId: 'club-b',
            toBirthTeamDocumentId: 'team-b',
          }],
        },
      },
    })

    expect(compareStatsCounterpartsV2({
      expectedCounterparts: expected,
      actualCounterparts: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '26_27',
        teamSeason: {
          transfersIn: [expected[0].fact],
        },
      }],
    })).toEqual([])
  })
})
