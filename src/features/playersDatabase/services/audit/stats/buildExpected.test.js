// src/features/playersDatabase/services/audit/stats/buildExpected.test.js

import { buildStatsAuditExpected } from './buildExpected.js'

describe('Stats audit expected state', () => {
  test('treats a missing Team Season as legal before a roster is loaded', () => {
    const result = buildStatsAuditExpected({
      seasonId: '2026_2027',
      actual: {
        teamRoot: null,
        teamSeason: null,
        league: { id: 'league-1' },
      },
    })

    expect(result).toEqual({
      complete: true,
      applicable: false,
      reason: 'no_roster',
      expected: null,
    })
  })

  test('reports a missing Team Season when Team Root already references the season', () => {
    const result = buildStatsAuditExpected({
      seasonId: '2026_2027',
      actual: {
        teamRoot: {
          seasonRefsById: {
            '2026_2027': { teamSeasonDocumentId: 'team-1__2026_2027' },
          },
        },
        teamSeason: null,
        league: { id: 'league-1' },
      },
    })

    expect(result).toEqual({
      complete: false,
      reason: 'missing_team_season',
      expected: null,
    })
  })

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
