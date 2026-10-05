// src/features/playersDatabase/domain/stats/validation.test.js

import { validateStatsRowsAgainstLeague } from './validation.js'

const buildPlayer = index => ({
  playerId: `player-${index}`,
  games: 2,
  starts: 0,
  goals: 0,
  minutes: 157,
  substituteIn: 0,
  substitutedOut: 0,
  yellowCards: 0,
})

describe('validateStatsRowsAgainstLeague', () => {
  test('uses the same total-minutes allowance as the import preview', () => {
    const result = validateStatsRowsAgainstLeague({
      players: Array.from({ length: 12 }, (_, index) => buildPlayer(index)),
      leagueContext: {
        teamGamePlayed: 2,
        gameDurationMinutes: 80,
        teamMinutes: 160,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      ageGroupId: 'u14',
    })

    expect(result.valid).toBe(true)
  })
})
