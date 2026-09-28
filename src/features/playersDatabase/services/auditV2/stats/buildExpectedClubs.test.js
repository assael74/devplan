import {
  buildExpectedStatsClubsV2,
} from './buildExpectedClubs.js'

const expectedCounterpart = {
  movementId: 'movement-1',
  target: {
    birthTeamDocumentId: 'counterpart-team',
    seasonKey: '26_27',
    side: 'transfersIn',
  },
}

const counterpart = ({
  movementId = 'movement-1',
  withRoot = true,
  withLeague = true,
} = {}) => ({
  birthTeamDocumentId: 'counterpart-team',
  seasonKey: '26_27',
  teamRoot: withRoot
    ? {
        id: 'counterpart-team',
        birthTeamDocumentId: 'counterpart-team',
        clubId: 'counterpart-club',
        ageGroupId: 'u15',
        birthYear: 2012,
      }
    : null,
  teamSeason: {
    seasonKey: '26_27',
    leagueId: 'counterpart-league',
    transfersIn: [{
      movementId,
    }],
    transfersOut: [],
    pendingPlayers: [],
    teamPlayers: [],
    playersCount: 0,
  },
  league: withLeague
    ? {
        id: 'counterpart-league',
        leagueId: 'counterpart-league',
        current: {
          seasonKey: '26_27',
          tableRank: [{
            birthTeamDocumentId: 'counterpart-team',
            teamId: 'counterpart-team',
            games: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
          }],
        },
      }
    : null,
})

describe('Stats Audit V2 counterpart Club scope', () => {
  test('projects canonical Stats scout profile summary into Club and Clubs Master', () => {
    const result = buildExpectedStatsClubsV2({
      canonical: {
        birthTeamDocumentId: 'local-team',
        seasonKey: '26_27',
        teamRoot: {
          id: 'local-team',
          birthTeamDocumentId: 'local-team',
          clubId: 'beitar-jerusalem',
          ageGroupId: 'u15',
          birthYear: 2012,
        },
        teamSeason: {
          seasonKey: '26_27',
          leagueId: 'u15-premier',
          playersCount: 23,
          scoutProfilesSummary: {
            total: 0,
            profileCounts: {},
          },
        },
        league: {
          id: 'u15-premier',
          current: {
            seasonKey: '26_27',
            tableRank: [{
              birthTeamDocumentId: 'local-team',
              teamId: 'local-team',
            }],
          },
        },
      },
    })

    expect(result[0].season.scoutProfilesSummary).toEqual({
      total: 0,
      profileCounts: {},
    })
    expect(result[0].masterSeason.scoutProfilesSummary).toEqual({
      total: 0,
      profileCounts: {},
    })
  })
  test('includes counterpart Club only when root, season, league and canonical movement exist', () => {
    const result = buildExpectedStatsClubsV2({
      canonical: {},
      counterpartCanonical: [
        counterpart(),
      ],
      expectedCounterparts: [
        expectedCounterpart,
      ],
    })

    expect(result).toEqual([
      expect.objectContaining({
        clubId: 'counterpart-club',
      }),
    ])
  })

  test('does not include counterpart Club when canonical movement is absent', () => {
    expect(buildExpectedStatsClubsV2({
      canonical: {},
      counterpartCanonical: [
        counterpart({
          movementId: 'other-movement',
        }),
      ],
      expectedCounterparts: [
        expectedCounterpart,
      ],
    })).toEqual([])
  })

  test('does not include counterpart Club without Team Root or League', () => {
    expect(buildExpectedStatsClubsV2({
      canonical: {},
      counterpartCanonical: [
        counterpart({
          withRoot: false,
        }),
        counterpart({
          withLeague: false,
        }),
      ],
      expectedCounterparts: [
        expectedCounterpart,
      ],
    })).toEqual([])
  })
})
