// src/features/playersDatabase/domain/validation/playerStatsLeague.validation.test.js

import { validatePlayerStatsAgainstLeague } from './playerStatsLeague.validation.js'

const buildPlayer = overrides => ({
  games: 2,
  starts: 0,
  substituteIn: 0,
  substitutedOut: 0,
  minutes: 0,
  goals: 0,
  ...overrides,
})

describe('validatePlayerStatsAgainstLeague', () => {
  test('returns the equal minutes reduction for a total-minutes overflow', () => {
    const players = Array.from({ length: 12 }, () => buildPlayer({ minutes: 160 }))

    const validation = validatePlayerStatsAgainstLeague({
      players,
      teamPerformance: {
        teamGamePlayed: 2,
        gameDurationMinutes: 80,
        goalsFor: 0,
      },
      ageGroupId: 'u14',
    })

    const minutesCheck = validation.checks.find(
      check => check.code === 'minutes_total_exceed_league_capacity'
    )
    expect(minutesCheck.valid).toBe(false)
    expect(minutesCheck.adjustment).toEqual({
      type: 'equal_minutes_reduction',
      amountPerPlayer: 1,
      playersCount: 12,
    })
  })

  test('reports the player minutes blocker in Hebrew on the minutes field', () => {
    const validation = validatePlayerStatsAgainstLeague({
      players: [buildPlayer({ minutes: 161 })],
      teamPerformance: {
        teamGamePlayed: 2,
        gameDurationMinutes: 80,
        goalsFor: 0,
      },
      ageGroupId: 'u14',
    })

    expect(validation.rowIssues[0]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        field: 'minutes',
        code: 'minutes_exceed_100_pct',
        message: expect.stringContaining('דקות השחקן'),
      }),
    ]))
  })
})
