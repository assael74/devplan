// src/features/playersDatabase/domain/stats/statsProjection.builder.test.js

import {
  buildPlayerSearchIndexProjection,
  buildPlayerSeasonProjection,
} from './statsProjection.builder.js'

const seasonId = '2025_2026'
const teamId = 'club-a_2010_1'
const playerId = 'player__2010__12345'

const teamSeason = {
  identity: {
    teamSeasonDocumentId: `${teamId}__${seasonId}`,
    teamId,
    seasonId,
    seasonKey: '25/26',
    seasonStatus: 'active',
    clubId: 'club-a',
    birthYear: 2010,
    teamSlot: 1,
    leagueId: 'league-1',
    ageGroupId: 'u16',
  },
  roster: {
    playersById: {
      [playerId]: {
        externalPlayerId: '12345',
        fullName: 'Player One',
        normalizedName: 'player one',
        aliases: [],
        rosterStatus: 'regular',
      },
    },
  },
  stats: {
    playersById: {
      [playerId]: {
        statsStatus: 'loaded',
        playerStats: { games: 5 },
        lineClassification: { line: 'attack' },
      },
    },
  },
  scouting: {
    playersById: {
      [playerId]: {
        primaryPosition: 'forward',
        positionLayer: 'attack',
        primary: { profileId: 'profile-a', teamGateMode: 'open' },
        secondary: { profileId: 'profile-b' },
        professionalProfileIds: ['profile-a'],
        preliminaryProfileIds: [],
        combinationIds: ['combination-a'],
        evidence: {},
      },
    },
  },
  manual: { playersById: {} },
  movement: {
    transfersInById: {
      'movement-1': {
        movementId: 'movement-1',
        playerId,
        fromTeamId: 'club-b_2010_1',
      },
    },
  },
  competitionSnapshot: {
    clubLevel: 2,
    clubStrengthLevel: 3,
  },
}

const league = {
  level: 2,
  ageGroupLabel: 'U16',
  region: 'north',
  seasonsById: {
    [seasonId]: {
      seasonUrl: 'https://example.test/season',
      table: {
        teamsById: {
          [teamId]: { teamUrl: 'https://example.test/team' },
        },
      },
    },
  },
}

describe('target Stats projections', () => {
  test('Player Season omits Player Root snapshots and playerId from Movement rows', () => {
    const projection = buildPlayerSeasonProjection({
      playerId,
      teamSeason,
      league,
      seasonId,
    })

    expect(projection.identity.playerId).toBe(playerId)
    expect(projection.team.scouting).not.toHaveProperty('primaryPosition')
    expect(projection.team.scouting).not.toHaveProperty('positionLayer')
    expect(projection.team.movementsById['movement-1']).not.toHaveProperty('playerId')
  })

  test('Player SearchIndex search ids include profiles and combinations', () => {
    const projection = buildPlayerSearchIndexProjection({
      playerId,
      playerRoot: { identity: { playerId }, primaryPosition: 'forward' },
      teamSeason,
      league,
      clubDirectoryEntry: { clubLevel: 9, clubStrengthLevel: 9 },
      seasonId,
    })

    expect(projection.scoutProfileSearchIds).toEqual(expect.arrayContaining([
      'profile-a',
      'profile-b',
      'combination-a',
    ]))
    expect(projection.team.clubLevel).toBe(2)
    expect(projection.team.clubStrengthLevel).toBe(3)
  })
})
