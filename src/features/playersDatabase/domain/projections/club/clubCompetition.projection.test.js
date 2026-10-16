// src/features/playersDatabase/domain/projections/club/clubCompetition.projection.test.js
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
      unavailableReasons: ['SEASON_BEFORE_HALFWAY'],
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
      unavailableReasons: ['TEAM_NOT_IN_TABLE'],
    })
  })
})

const lateSeasonRows = [20, 19, 5, 2].map((points, index) => ({
  teamId: `team-${index}`, position: index + 1, points, teamGamePlayed: 8,
}))
const forecast = (index, competitionRules) => buildCompetitionProjection({
  rows: lateSeasonRows,
  targetTeam: { teamId: `team-${index}` },
  leagueLevel: 2,
  expectedGamesPerTeam: 10,
  competitionRules,
})

test('being mathematically safe does not hide promotion potential', () => {
  expect(forecast(0, {
    promotion: { directPlaces: [1] }, relegation: { directPlaces: [4] },
  })).toMatchObject({ status: 'PROMOTION_POSSIBLE', projectedNextLeagueLevel: 1 })
})

test('playoff places indicate a possibility or risk, not a confirmed outcome', () => {
  expect(forecast(0, {
    promotion: { playoffPlaces: [1] }, relegation: { directPlaces: [4] },
  }).status).toBe('PROMOTION_POSSIBLE')
  expect(forecast(3, {
    promotion: { directPlaces: [1] }, relegation: { playoffPlaces: [4] },
  }).status).toBe('RELEGATION_RISK')
  expect(forecast(1, {
    promotion: { directPlaces: [1] }, relegation: { directPlaces: [4] },
  }).status).toBe('SAFE_CONFIRMED')
})

test.each([[0, 'PROMOTED_CONFIRMED'], [3, 'RELEGATED_CONFIRMED']])('direct outcomes remain confirmed at season end', (index, status) => {
  expect(buildCompetitionProjection({
    rows: lateSeasonRows.map(row => ({ ...row, teamGamePlayed: 10 })),
    targetTeam: { teamId: `team-${index}` }, leagueLevel: 2, expectedGamesPerTeam: 10,
    competitionRules: { promotion: { directPlaces: [1] }, relegation: { directPlaces: [4] } },
  }).status).toBe(status)
})
