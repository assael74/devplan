import { buildPlayerScoutResult as buildPackageResult } from '@devplan/players-scout-engine/players/index.js'
import { buildPlayerScoutResult as buildCompatibilityResult } from '../../../../shared/scouting/players/index.js'

describe('shared Player Scout engine parity', () => {
  test('package and compatibility path return an identical result', () => {
    const input = {
      player: {
        primaryPosition: 'defense',
        games: 20,
        goals: 4,
        minutes: 1407,
      },
      team: {
        ageGroupId: 'u14',
        clubId: 'club_a',
        clubLevel: 2,
        clubStrengthLevel: 2,
        leagueLevel: 3,
        gamesPlayed: 23,
        leagueGameTime: 80,
        defense: { priorityLevel: 'negative' },
      },
      season: { seasonKey: '25/26', seasonStatus: 'completed', leagueNumGames: 23 },
      perspective: 'players_database',
    }

    expect(buildPackageResult(input)).toEqual(buildCompatibilityResult(input))
  })
})