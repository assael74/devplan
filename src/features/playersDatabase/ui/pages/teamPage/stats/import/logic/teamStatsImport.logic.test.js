import { buildApprovedStatsImportPlayer } from './teamStatsImport.logic.js'

describe('buildApprovedStatsImportPlayer', () => {
  test('maps the flat modal stats row to the canonical Stats V2 contract', () => {
    expect(buildApprovedStatsImportPlayer({
      playerId: 'player-1',
      games: 12,
      goals: 3,
      yellowCards: 2,
      minutes: 720,
      starts: 8,
      substituteIn: 3,
      substitutedOut: 4,
    })).toMatchObject({
      playerId: 'player-1',
      statsStatus: 'loaded',
      playerStats: {
        games: 12,
        goals: 3,
        yellowCards: 2,
        minutes: 720,
        starts: 8,
        substituteIn: 3,
        substitutedOut: 4,
      },
    })
  })
})
