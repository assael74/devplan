// src/features/playersDatabase/services/audit/stats/buildExpected.test.js

import { buildStatsAuditExpected } from './buildExpected.js'

describe('Stats audit expected state', () => {
  test('is complete without ClubProfile or ClubsDirectory', () => {
    const seasonId = '2026_2027'
    const teamId = 'club-1_2011_1'
    const statsOnlyPlayerId = 'player__2011__90000'
    const result = buildStatsAuditExpected({
      seasonId,
      approvedState: {
        playerRootPlans: [],
        playerSeasonPlans: [{ playerId: statsOnlyPlayerId }],
        playerSearchIndexPlans: [{ playerId: statsOnlyPlayerId }],
      },
      actual: {
        teamSeason: {
          identity: {
            teamSeasonDocumentId: `${teamId}__${seasonId}`,
            teamId,
            seasonId,
            seasonKey: '26/27',
            seasonStatus: 'active',
            clubId: 'club-1',
            leagueId: 'league-1',
            birthYear: 2011,
            teamSlot: 1,
            ageGroupId: 'u15',
          },
          competitionSnapshot: { clubLevel: 2, clubStrengthLevel: 3 },
          roster: { playersById: {} },
          stats: { playersById: {}, statsLoadState: { status: 'loaded' } },
          scouting: { playersById: {} },
          teamTaskSignals: {},
        },
        league: {
          id: 'league-1',
          leagueId: 'league-1',
          level: 2,
          seasonsById: {
            [seasonId]: {
              table: { teamsById: { [teamId]: { clubId: 'club-1' } } },
            },
          },
        },
        leaguesCenter: {},
        clubsCenter: {},
        playerRootsById: {
          [statsOnlyPlayerId]: {
            identity: {
              playerId: statsOnlyPlayerId,
              externalPlayerId: '90000',
              fullName: 'שחקן סטטס',
            },
          },
        },
      },
    })

    expect(result.complete).toBe(true)
    expect(result.reason).toBe('')
    expect(result.expected.playerSeasonsById).toHaveProperty(statsOnlyPlayerId)
    expect(result.expected.playerSearchIndexesById).toHaveProperty(statsOnlyPlayerId)
  })
})
