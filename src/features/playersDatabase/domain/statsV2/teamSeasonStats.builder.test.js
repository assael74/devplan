// src/features/playersDatabase/domain/statsV2/teamSeasonStats.builder.test.js

import {
  STATS_RELOAD_DECISION,
  buildStatsReloadDecisionState,
} from './statsReloadDecision.builder.js'
import { buildFinalStatsTeamSeasonState } from './teamSeasonStats.builder.js'

const canonical = {
  teamRoot: { id: 'team-1' },
  teamSeason: {
    id: 'team-1__26_27',
    seasonId: '28',
    seasonKey: '26_27',
    teamPlayers: [
      {
        playerId: 'p1',
        fullName: 'One',
        rosterStatus: 'regular',
        statsStatus: 'loaded',
        playerStats: { games: 4, goals: 1, minutes: 200 },
      },
      {
        playerId: 'p2',
        fullName: 'Two',
        rosterStatus: 'regular',
        statsStatus: 'loaded',
        playerStats: { games: 3, goals: 0, minutes: 120 },
      },
    ],
    teamStats: {
      teamGamePlayed: 4,
      goalsFor: 5,
      goalsAgainst: 3,
    },
  },
  league: {
    id: 'league-1',
    current: {
      seasonId: '28',
      seasonKey: '26_27',
      seasonStatus: 'active',
      leagueTotalRound: 30,
      tableRank: [
        {
          teamId: 'team-1',
          birthTeamDocumentId: 'team-1',
          birthTeamSlot: 1,
          rank: 1,
          games: 4,
          goalsFor: 5,
          goalsAgainst: 3,
          points: 10,
        },
      ],
    },
    history: [],
  },
}

const buildReloadState = decision => buildStatsReloadDecisionState({
  previousPlayers: canonical.teamSeason.teamPlayers,
  incomingPlayers: [
    {
      playerId: 'p1',
      fullName: 'One',
      rosterStatus: 'regular',
      statsStatus: 'loaded',
      playerStats: { games: 5, goals: 2, minutes: 260 },
    },
  ],
  decisions: {
    p2: decision,
  },
})

describe('teamSeasonStats.builder', () => {
  test('removeStats keeps roster membership and clears the previous stats', () => {
    const result = buildFinalStatsTeamSeasonState({
      canonical,
      season: { seasonId: '28', seasonKey: '26_27' },
      team: { birthTeamDocumentId: 'team-1' },
      incomingPlayers: [
        {
          playerId: 'p1',
          fullName: 'One',
          rosterStatus: 'regular',
          statsStatus: 'loaded',
          playerStats: { games: 5, goals: 2, minutes: 260 },
        },
      ],
      reloadDecisionState: buildReloadState(STATS_RELOAD_DECISION.REMOVE_STATS),
      statsLoadState: { status: 'approved' },
    })

    const player = result.finalTeamSeasonPreview.teamPlayers.find(row => row.playerId === 'p2')

    expect(player.rosterStatus).toBe('regular')
    expect(player.statsStatus).toBe('missing')
    expect(player.playerStats).toEqual({})
    expect(result.localMovementPatch).toBeNull()
  })

  test('preserveStats retains the previous stats exactly', () => {
    const result = buildFinalStatsTeamSeasonState({
      canonical,
      season: { seasonId: '28', seasonKey: '26_27' },
      team: { birthTeamDocumentId: 'team-1' },
      incomingPlayers: [
        {
          playerId: 'p1',
          fullName: 'One',
          rosterStatus: 'regular',
          statsStatus: 'loaded',
          playerStats: { games: 5, goals: 2, minutes: 260 },
        },
      ],
      reloadDecisionState: buildReloadState(STATS_RELOAD_DECISION.PRESERVE_STATS),
      statsLoadState: { status: 'approved' },
    })

    const player = result.finalTeamSeasonPreview.teamPlayers.find(row => row.playerId === 'p2')

    expect(player.statsStatus).toBe('loaded')
    expect(player.playerStats).toEqual({ games: 3, goals: 0, minutes: 120 })
  })

  test('derives seasonStatus from canonical League', () => {
    const result = buildFinalStatsTeamSeasonState({
      canonical,
      season: { seasonId: '28', seasonKey: '26_27', seasonStatus: 'completed' },
      team: { birthTeamDocumentId: 'team-1' },
      incomingPlayers: canonical.teamSeason.teamPlayers,
      reloadDecisionState: buildStatsReloadDecisionState({
        previousPlayers: canonical.teamSeason.teamPlayers,
        incomingPlayers: canonical.teamSeason.teamPlayers,
      }),
      statsLoadState: { status: 'approved' },
    })

    expect(result.seasonStatus).toBe('active')
    expect(result.finalTeamSeasonPreview.seasonStatus).toBe('active')
  })

  test('applies youngerAgeGroup before scout and balance calculation', () => {
    const incomingPlayers = [
      ...canonical.teamSeason.teamPlayers,
      {
        playerId: 'p3',
        fullName: 'Three',
        statsStatus: 'loaded',
        statsMovementDecision: 'youngerAgeGroup',
        playerStats: { games: 2, goals: 0, minutes: 50 },
      },
    ]
    const result = buildFinalStatsTeamSeasonState({
      canonical,
      season: { seasonId: '28', seasonKey: '26_27' },
      team: { birthTeamDocumentId: 'team-1' },
      incomingPlayers,
      reloadDecisionState: buildStatsReloadDecisionState({
        previousPlayers: canonical.teamSeason.teamPlayers,
        incomingPlayers,
      }),
      statsLoadState: { status: 'approved' },
    })

    const player = result.finalTeamSeasonPreview.teamPlayers.find(row => row.playerId === 'p3')

    expect(player.rosterStatus).toBe('youngerAgeGroup')
    expect(player.scoutProfiles || []).toEqual([])
    expect(result.finalTeamSeasonPreview.playersCount).toBe(2)
  })

  test('applies left before scout and balance calculation', () => {
    const incomingPlayers = [
      ...canonical.teamSeason.teamPlayers,
      {
        playerId: 'p3',
        fullName: 'Three',
        statsStatus: 'loaded',
        statsMovementDecision: 'left',
        playerStats: { games: 2, goals: 0, minutes: 50 },
      },
    ]
    const result = buildFinalStatsTeamSeasonState({
      canonical,
      season: { seasonId: '28', seasonKey: '26_27' },
      team: { birthTeamDocumentId: 'team-1' },
      incomingPlayers,
      reloadDecisionState: buildStatsReloadDecisionState({
        previousPlayers: canonical.teamSeason.teamPlayers,
        incomingPlayers,
      }),
      statsLoadState: { status: 'approved' },
    })

    const player = result.finalTeamSeasonPreview.teamPlayers.find(row => row.playerId === 'p3')

    expect(player.rosterStatus).toBe('left')
    expect(player.scoutProfiles || []).toEqual([])
    expect(result.finalTeamSeasonPreview.playersCount).toBe(2)
  })

  test('stores canonical Team Scout from League in final Team Season preview', () => {
    const result = buildFinalStatsTeamSeasonState({
      canonical,
      season: { seasonId: '28', seasonKey: '26_27' },
      team: { birthTeamDocumentId: 'team-1' },
      incomingPlayers: canonical.teamSeason.teamPlayers,
      reloadDecisionState: buildStatsReloadDecisionState({
        previousPlayers: canonical.teamSeason.teamPlayers,
        incomingPlayers: canonical.teamSeason.teamPlayers,
      }),
      statsLoadState: { status: 'approved' },
    })

    expect(result.teamScout).toHaveProperty('offense')
    expect(result.teamScout).toHaveProperty('defense')
    expect(result.finalTeamSeasonPreview.teamScout).toEqual(result.teamScout)
    expect(result.finalTeamSeasonPreview.performance).toEqual(result.teamScout)
  })

  test('blocks an incoming Stats row with no identifier or name', () => {
    expect(() => buildFinalStatsTeamSeasonState({
      canonical,
      season: { seasonId: '28', seasonKey: '26_27' },
      team: { birthTeamDocumentId: 'team-1' },
      incomingPlayers: [{ statsStatus: 'loaded', playerStats: { games: 1 } }],
      reloadDecisionState: {
        missingPlayers: [],
        resolved: [],
        unresolved: [],
        isComplete: true,
      },
      statsLoadState: { status: 'approved' },
    })).toThrow('Every incoming Stats row requires a resolved player identity')
  })

  test('uses the matching completed League history season for Team Scout', () => {
    const completedCanonical = {
      ...canonical,
      teamSeason: {
        ...canonical.teamSeason,
        id: 'team-1__25_26',
        seasonId: '27',
        seasonKey: '25_26',
      },
      league: {
        id: 'league-1',
        current: null,
        history: [
          {
            seasonId: '26',
            seasonKey: '24_25',
            seasonStatus: 'completed',
            tableRank: [{ teamId: 'other-team', rank: 1, games: 10, goalsFor: 20, goalsAgainst: 5 }],
          },
          {
            seasonId: '27',
            seasonKey: '25_26',
            seasonStatus: 'completed',
            tableRank: [{
              teamId: 'team-1',
              birthTeamDocumentId: 'team-1',
              birthTeamSlot: 1,
              rank: 2,
              games: 12,
              goalsFor: 18,
              goalsAgainst: 8,
              points: 28,
            }],
          },
        ],
      },
    }
    const result = buildFinalStatsTeamSeasonState({
      canonical: completedCanonical,
      season: { seasonId: '27', seasonKey: '25_26' },
      team: { birthTeamDocumentId: 'team-1' },
      incomingPlayers: completedCanonical.teamSeason.teamPlayers,
      reloadDecisionState: buildStatsReloadDecisionState({
        previousPlayers: completedCanonical.teamSeason.teamPlayers,
        incomingPlayers: completedCanonical.teamSeason.teamPlayers,
      }),
      statsLoadState: { status: 'approved' },
    })

    expect(result.seasonStatus).toBe('completed')
    expect(result.teamScout).toHaveProperty('offense')
    expect(result.teamScout).toHaveProperty('defense')
  })
})
