const { TextDecoder, TextEncoder } = require('util')

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

const { mergeTeamPlayerStats, buildTeamSeasonDoc } = require('./teamSeason.model.js')
const { buildScoutIdentityContext } = require('./teamSeasonStats.js')

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

test('persists only the revision-safe Scout identity context', () => {
  const team = {
    clubId: 'club_a',
    birthTeamSlot: 2,
    tableRank: 4,
    teamStats: { points: 18 },
  }
  const season = buildTeamSeasonDoc({
    team,
    season: { seasonId: 's25', seasonKey: '25/26', ageGroupId: 'u15' },
  })

  expect(season).toMatchObject({
    scoutIdentityContext: { clubId: 'club_a', birthTeamSlot: 2 },
    tableRank: 4,
    teamStats: { points: 18 },
  })
  expect(team).toEqual({
    clubId: 'club_a',
    birthTeamSlot: 2,
    tableRank: 4,
    teamStats: { points: 18 },
  })
})

test('keeps the prior identity snapshot when a stats refresh omits it', () => {
  expect(buildScoutIdentityContext({
    team: {},
    baseSeasonDoc: { scoutIdentityContext: { clubId: 'club_a', birthTeamSlot: 3 } },
  })).toEqual({ clubId: 'club_a', birthTeamSlot: 3 })
})