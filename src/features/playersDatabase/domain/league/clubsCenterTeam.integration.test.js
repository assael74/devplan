// src/features/playersDatabase/domain/league/clubsCenterTeam.integration.test.js

import { buildClubsCenterTeamProjection } from './clubsCenterTeam.builder.js'

test('builds competition projection from canonical officialTable fields', () => {
  const seasonId = '2025_2026'
  const teamsById = {
    'club-a_2010_1': {
      clubId: 'club-a',
      teamSlot: 1,
      officialTable: {
        rank: 1,
        points: 30,
        goalsFor: 25,
        goalsAgainst: 5,
        teamGamePlayed: 10,
      },
    },
    'club-b_2010_1': {
      clubId: 'club-b',
      teamSlot: 1,
      officialTable: {
        rank: 2,
        points: 1,
        goalsFor: 3,
        goalsAgainst: 20,
        teamGamePlayed: 10,
      },
    },
  }
  const result = buildClubsCenterTeamProjection({
    league: {
      leagueId: 'league-1',
      ageGroupId: 'u16',
      level: 2,
    },
    season: {
      seasonId,
      seasonStatus: 'active',
      birthYear: 2010,
      leagueTotalRound: 18,
      competitionRules: {
        configured: true,
        promotion: {
          enabled: true,
          directPlaces: [1],
          playoffPlaces: [],
        },
        relegation: {
          enabled: false,
          directPlaces: [],
          playoffPlaces: [],
        },
      },
      table: { teamsById },
    },
    seasonId,
    teamId: 'club-a_2010_1',
    teamRow: teamsById['club-a_2010_1'],
  })

  expect(result.competitionProjection.effective.projectedNextLeagueLevel).toBe(1)
  expect(result.competitionProjection.effective.status).not.toBe('UNKNOWN')
})
