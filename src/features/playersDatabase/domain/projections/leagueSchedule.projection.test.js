import {
  resolveLeagueScheduleProjection,
} from './leagueSchedule.projection.js'

describe('league schedule projection', () => {
  test('preserves an explicit canonical total instead of the team-count fallback', () => {
    expect(resolveLeagueScheduleProjection({
      teamsCount: 14,
      leagueTotalRound: 18,
    })).toMatchObject({
      leagueTotalRound: 18,
      expectedGamesPerTeam: 26,
      leagueTotalRoundSource: 'canonical',
    })
  })

  test.each([
    [14, 26, 26],
    [13, 26, 24],
    [12, 22, 22],
    [11, 22, 20],
  ])('uses the documented fallback for %i teams', (
    teamsCount,
    leagueTotalRound,
    expectedGamesPerTeam
  ) => {
    expect(resolveLeagueScheduleProjection({ teamsCount })).toMatchObject({
      leagueTotalRound,
      expectedGamesPerTeam,
      leagueTotalRoundSource: 'teamsCountFallback',
    })
  })

  test('does not invent a total when neither a canonical value nor a reliable team count exists', () => {
    expect(resolveLeagueScheduleProjection({ teamsCount: 0 })).toMatchObject({
      leagueTotalRound: 0,
      expectedGamesPerTeam: 0,
      leagueTotalRoundSource: 'missing',
    })
  })

  test('keeps the canonical total on an identical or partial-table reload', () => {
    const initial = resolveLeagueScheduleProjection({
      teamsCount: 14,
      leagueTotalRound: 26,
    })
    const partialReload = resolveLeagueScheduleProjection({
      teamsCount: 4,
      leagueTotalRound: initial.leagueTotalRound,
    })

    expect(partialReload.leagueTotalRound).toBe(26)
    expect(partialReload.leagueTotalRoundSource).toBe('canonical')
  })
})
