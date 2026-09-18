import { buildCompetitionProjection } from './clubCompetition.projection.js'

const rows = [
  { teamId: 'club_2011_1', position: 1, points: 12, teamGamePlayed: 4 },
  { teamId: 'other-1', position: 2, points: 9, teamGamePlayed: 4 },
  { teamId: 'other-2', position: 3, points: 6, teamGamePlayed: 4 },
  { teamId: 'other-3', position: 4, points: 3, teamGamePlayed: 4 },
]

describe('buildCompetitionProjection', () => {
  test('uses the source team current league level before half of its league season', () => {
    expect(buildCompetitionProjection({
      rows,
      targetTeam: { teamId: 'club_2011_1' },
      leagueLevel: 2,
      competitionRules: {
        promotion: { directPlaces: [1] },
        relegation: { directPlaces: [4] },
      },
      expectedGamesPerTeam: 18,
    })).toEqual({
      projectedNextLeagueLevel: 2,
      status: 'CURRENT_LEVEL',
      projectedRank: 1,
      seasonProgressPct: expect.any(Number),
    })
  })

  test('uses the source team current league level when competition rules are not loaded', () => {
    expect(buildCompetitionProjection({
      rows,
      targetTeam: { teamId: 'club_2011_1' },
      leagueLevel: 2,
      competitionRules: {},
      expectedGamesPerTeam: 18,
    })).toEqual(expect.objectContaining({
      projectedNextLeagueLevel: 2,
      status: 'CURRENT_LEVEL',
    }))
  })

  test('keeps UNKNOWN only when the source team cannot be found in a loaded league table', () => {
    expect(buildCompetitionProjection({
      rows,
      targetTeam: { teamId: 'missing-team' },
      leagueLevel: 2,
      competitionRules: {},
      expectedGamesPerTeam: 18,
    })).toEqual({
      projectedNextLeagueLevel: 2,
      status: 'UNKNOWN',
      projectedRank: null,
      seasonProgressPct: 0,
    })
  })
})
