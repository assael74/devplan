// src/features/playersDatabase/domain/stats/statsClear.builder.test.js

import { buildStatsClearApprovedState } from './statsClear.builder.js'

const teamId = 'club-1_2011_1'
const seasonId = '2026_2027'
const playerId = 'player__2011__10000'
const statsOnlyPlayerId = 'player__2011__10001'

const buildSources = ({ playerRoot = null, statsStatus = 'loaded' } = {}) => ({
  teamRoot: {
    identity: { teamId, clubId: 'club-1', birthYear: 2011, teamSlot: 1 },
  },
  teamSeason: {
    id: `${teamId}__${seasonId}`,
    identity: {
      teamSeasonDocumentId: `${teamId}__${seasonId}`,
      teamId,
      seasonId,
      seasonKey: '26/27',
      seasonStatus: 'active',
      clubId: 'club-1',
      leagueId: 'league-1',
      birthYear: 2011,
      teamSlot: 1,
      ageGroupId: 'u16',
    },
    competitionSnapshot: {
      officialTable: { rank: 2, goalsFor: 20, goalsAgainst: 10, teamGamePlayed: 8 },
    },
    roster: {
      playersById: {
        [playerId]: { externalPlayerId: '10000', fullName: 'Player', rosterStatus: 'regular' },
      },
      rosterImport: { source: 'roster' },
    },
    stats: statsStatus === 'loaded'
      ? {
          playersById: {
            [playerId]: { statsStatus: 'loaded', playerStats: { games: 8, goals: 2 } },
          },
          teamBalance: { status: 'balanced' },
          statsLoadState: { status: 'loaded' },
        }
      : {
          playersById: {},
          teamBalance: {},
          statsLoadState: { status: 'missing' },
        },
    movement: {
      transfersInById: { move1: { movementId: 'move1', playerId } },
      transfersOutById: {},
    },
    scouting: statsStatus === 'loaded'
      ? { playersById: { [playerId]: { professionalProfileIds: ['profile-1'] } }, scoutProfilesSummary: { count: 1 } }
      : { playersById: {}, scoutProfilesSummary: {} },
    manual: { playersById: { [playerId]: { playerUrl: 'manual-url' } } },
    teamTaskSignals: { offense: true, defense: true },
    teamTaskAvailability: { availability: 'available', reason: '' },
  },
  league: {
    id: 'league-1',
    leagueId: 'league-1',
    level: 1,
    ageGroupLabel: 'U16',
    region: 'center',
    seasonsById: {
      [seasonId]: {
        seasonKey: '26/27',
        seasonStatus: 'active',
        table: {
          teamsById: {
            [teamId]: {
              clubId: 'club-1',
              teamUrl: 'team-url',
              officialTable: { rank: 2, goalsFor: 20, goalsAgainst: 10, teamGamePlayed: 8 },
            },
          },
        },
      },
    },
  },
  playerRootsById: playerRoot ? { [playerId]: playerRoot } : {},
  playerSeasonsById: { [playerId]: { id: `playerSeason__${playerId}__${seasonId}` } },
  playerSearchIndexesById: { [playerId]: { id: `playerSeason__${playerId}__${teamId}__${seasonId}` } },
})

describe('buildStatsClearApprovedState', () => {
  test('removes only Stats-owned state and preserves roster, movement, manual and official League facts', () => {
    const sources = buildSources()
    const approved = buildStatsClearApprovedState({
      leagueId: 'league-1',
      teamId,
      seasonId,
      updatedAt: '2026-10-03T00:00:00.000Z',
      sources,
    })

    expect(approved.canonicalTeamSeason.roster).toEqual(sources.teamSeason.roster)
    expect(approved.canonicalTeamSeason.movement).toEqual(sources.teamSeason.movement)
    expect(approved.canonicalTeamSeason.manual).toEqual(sources.teamSeason.manual)
    expect(approved.canonicalTeamSeason.competitionSnapshot).toEqual(sources.teamSeason.competitionSnapshot)
    expect(approved.canonicalTeamSeason.stats).toEqual({
      playersById: {},
      teamBalance: {},
      statsLoadState: { status: 'missing', updatedAt: '2026-10-03T00:00:00.000Z' },
      updatedAt: '2026-10-03T00:00:00.000Z',
    })
    expect(approved.canonicalTeamSeason.scouting.playersById).toEqual({})
    expect(approved.leagueProjection.patch.stats).toEqual({ hasStats: false, statsComplete: false })
  })

  test('preserves a Player Root created during the Stats lifecycle', () => {
    const approved = buildStatsClearApprovedState({
      leagueId: 'league-1',
      teamId,
      seasonId,
      sources: buildSources({
        playerRoot: {
          identity: { playerId },
          primaryPosition: '',
          positionLayer: '',
          notes: '',
          agent: {},
          tracking: {},
          verification: {},
          manualImmediacyDecision: {},
          seasonRefsById: { [seasonId]: { playerSeasonDocumentId: 'season-ref' } },
        },
      }),
    })

    expect(approved.playerRootPlans).toEqual([])
    expect(approved.playerSeasonPlans.find(plan => plan.playerId === playerId).teamExists)
      .toBe(false)
    expect(approved.impact.playerRootsDeleted).toBe(0)
    expect(approved.playerSearchIndexPlans[0].projection.player.primaryPosition).toBe('')
  })

  test('does not modify manual Player Root state or season navigation', () => {
    const approved = buildStatsClearApprovedState({
      leagueId: 'league-1',
      teamId,
      seasonId,
      sources: buildSources({
        playerRoot: {
          identity: { playerId },
          notes: 'manual note',
          seasonRefsById: {
            [seasonId]: { playerSeasonDocumentId: 'current' },
            '2025_2026': { playerSeasonDocumentId: 'previous' },
          },
        },
      }),
    })

    expect(approved.playerRootPlans).toEqual([])
  })

  test('marks an already absent canonical state as idempotent', () => {
    const approved = buildStatsClearApprovedState({
      leagueId: 'league-1',
      teamId,
      seasonId,
      sources: buildSources({ statsStatus: 'missing' }),
    })

    expect(approved.currentStatsState).toBe('absent')
    expect(approved.isIdempotent).toBe(true)
    expect(approved.impact.playersAffected).toBe(0)
  })

  test('clears a Stats player that is no longer present in the current roster', () => {
    const sources = buildSources()
    sources.teamSeason.stats.playersById[statsOnlyPlayerId] = {
      statsStatus: 'loaded',
      playerStats: { games: 3, goals: 1 },
    }
    sources.teamSeason.scouting.playersById[statsOnlyPlayerId] = {
      professionalProfileIds: ['profile-2'],
    }
    sources.playerRootsById[statsOnlyPlayerId] = {
      identity: { playerId: statsOnlyPlayerId },
      seasonRefsById: { [seasonId]: { playerSeasonDocumentId: 'stats-only-season' } },
    }
    sources.playerSeasonsById[statsOnlyPlayerId] = {
      id: `playerSeason__${statsOnlyPlayerId}__${seasonId}`,
    }
    sources.playerSearchIndexesById[statsOnlyPlayerId] = {
      id: `playerSeason__${statsOnlyPlayerId}__${teamId}__${seasonId}`,
    }

    const approved = buildStatsClearApprovedState({
      leagueId: 'league-1',
      teamId,
      seasonId,
      sources,
    })

    expect(approved.playerRootPlans).toEqual([])
    expect(approved.playerSeasonPlans.map(plan => plan.playerId)).toContain(statsOnlyPlayerId)
    expect(approved.playerSearchIndexPlans.map(plan => plan.playerId)).toContain(statsOnlyPlayerId)
    expect(approved.playerSearchIndexPlans
      .find(plan => plan.playerId === statsOnlyPlayerId)
      .projection.player.statsStatus).toBe('')
  })
})
