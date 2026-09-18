const { TextDecoder, TextEncoder } = require('util')

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

const { mergeTeamPlayerStats } = require('./teamSeason.model.js')

describe('Team Season stats merge', () => {
  test('keeps a left participant and its status while refreshing statistics', () => {
    const result = mergeTeamPlayerStats({
      existingPlayers: [{
        playerId: 'player__2012__10001',
        externalPlayerId: '10001',
        fullName: 'שחקן שעזב',
        rosterStatus: 'left',
        playerStats: { games: 2 },
      }],
      players: [{
        playerId: 'player__2012__10001',
        externalPlayerId: '10001',
        fullName: 'שחקן שעזב',
        playerStats: { games: 7, minutes: 350 },
      }],
      season: { birthYear: 2012 },
    })

    expect(result).toEqual([
      expect.objectContaining({
        rosterStatus: 'left',
        playerStats: expect.objectContaining({ games: 7, minutes: 350 }),
      }),
    ])
  })
})
