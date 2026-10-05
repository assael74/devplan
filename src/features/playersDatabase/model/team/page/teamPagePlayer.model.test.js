// src/features/playersDatabase/model/team/page/teamPagePlayer.model.test.js

import {
  buildTeamPagePlayerRows,
  buildTeamPageSeasonView,
} from './teamPagePlayer.model.js'

const playerId = 'player__2012__12345'

const teamSeason = {
  identity: {
    teamId: 'club-a_2012_1',
    seasonId: '2025_2026',
    seasonKey: '25/26',
    seasonStatus: 'completed',
    leagueId: 'u13-center',
    ageGroupId: 'u13',
    birthYear: 2012,
  },
  competitionSnapshot: {
    teamUrl: 'https://example.test/team',
    officialTable: {
      rank: 3,
      points: 42,
      goalsFor: 51,
      goalsAgainst: 20,
      teamGamePlayed: 18,
    },
  },
  roster: {
    playersById: {
      [playerId]: {
        externalPlayerId: '12345',
        fullName: 'שחקן בדיקה',
        normalizedName: 'שחקן בדיקה',
        rosterStatus: 'regular',
        numShirt: 9,
      },
    },
  },
  stats: {
    playersById: {
      [playerId]: {
        statsStatus: 'loaded',
        playerStats: {
          games: 12,
          goals: 7,
          minutes: 730,
          teamGamePlayed: 18,
        },
        lineClassification: { line: 'ATTACK' },
      },
    },
    teamBalance: { balanceAvailability: { availability: 'available' } },
  },
  scouting: {
    playersById: {
      [playerId]: {
        primaryPosition: 'STRIKER',
        positionLayer: 'attack',
        primary: { profileId: 'finisher', strengthDepthPct: 81 },
        professionalProfileIds: ['finisher'],
        profileDepthsById: { finisher: 81 },
      },
    },
    scoutProfilesSummary: { total: 1 },
  },
  manual: {
    playersById: {
      [playerId]: { playerUrl: 'https://example.test/player' },
    },
  },
}

test('builds Team Page players from canonical roster, stats, scouting and manual maps', () => {
  expect(buildTeamPagePlayerRows({ teamSeason })).toEqual([
    expect.objectContaining({
      id: playerId,
      playerId,
      externalPlayerId: '12345',
      fullName: 'שחקן בדיקה',
      rosterStatus: 'regular',
      statsStatus: 'loaded',
      games: 12,
      goals: 7,
      minutes: 730,
      primaryPosition: 'STRIKER',
      positionLayer: 'attack',
      playerUrl: 'https://example.test/player',
      primaryScoutProfileId: 'finisher',
      scoutProfiles: [{ profileId: 'finisher', depthPct: 81 }],
    }),
  ])
})

test('builds the multi-season page view without changing the canonical document', () => {
  const view = buildTeamPageSeasonView({ teamSeason })

  expect(view).toMatchObject({
    seasonId: '2025_2026',
    seasonKey: '25/26',
    leagueId: 'u13-center',
    ageGroupId: 'u13',
    playersCount: 1,
    teamUrl: 'https://example.test/team',
    tableRank: 3,
    teamStats: { teamGamePlayed: 18 },
  })
  expect(view.teamPlayers).toHaveLength(1)
  expect(teamSeason).not.toHaveProperty('teamPlayers')
})
