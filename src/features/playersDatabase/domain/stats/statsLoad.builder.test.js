// src/features/playersDatabase/domain/stats/statsLoad.builder.test.js

import {
  buildStatsLoadApprovedState,
  buildStatsProjectionRepairApprovedState,
} from './statsLoad.builder.js'

const mockBuildScoutProfilesSummary = jest.fn()
const mockBuildPlayerLineClassificationState = jest.fn()
const mockBuildPlayerScoutState = jest.fn()
const mockBuildTeamBalanceState = jest.fn()
const mockBuildTeamPlayerScoutProjection = jest.fn()

jest.mock('../../model/scout/scoutProfilesSummary.model.js', () => ({
  buildScoutProfilesSummary: (...args) => mockBuildScoutProfilesSummary(...args),
}))

jest.mock('../orchestration/buildPlayerLineClassificationState.js', () => ({
  buildPlayerLineClassificationState: (...args) => mockBuildPlayerLineClassificationState(...args),
}))

jest.mock('../orchestration/buildPlayerScoutState.js', () => ({
  buildPlayerScoutState: (...args) => mockBuildPlayerScoutState(...args),
}))

jest.mock('../orchestration/buildTeamBalanceState.js', () => ({
  buildTeamBalanceState: (...args) => mockBuildTeamBalanceState(...args),
}))

jest.mock('../projections/playerScout.projection.js', () => ({
  buildTeamPlayerScoutProjection: (...args) => mockBuildTeamPlayerScoutProjection(...args),
}))

const playerId = 'player__2011__10000'
const leftPlayerId = 'player__2011__10001'

const sources = ({
  leagueId = 'league-1',
  teamSeasonLeagueId = 'league-1',
  leagueClubId = 'club-1',
  existingCounterpartTeamSeasonsById = {},
} = {}) => ({
  teamRoot: {
    identity: {
      teamId: 'club-1_2011_1',
      clubId: 'club-1',
      birthYear: 2011,
      teamSlot: 1,
    },
  },
  teamSeason: {
    id: 'club-1_2011_1__2026_2027',
    identity: {
      teamSeasonDocumentId: 'club-1_2011_1__2026_2027',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      seasonKey: '26/27',
      seasonStatus: 'active',
      clubId: 'club-1',
      leagueId: teamSeasonLeagueId,
      birthYear: 2011,
      teamSlot: 1,
    },
    roster: {
      playersById: {
        [playerId]: { externalPlayerId: '10000', fullName: 'Regular', rosterStatus: 'regular' },
        [leftPlayerId]: { externalPlayerId: '10001', fullName: 'Left', rosterStatus: 'left' },
      },
    },
    stats: { playersById: {} },
    competitionSnapshot: {
      clubLevel: 2,
      clubStrengthLevel: 3,
    },
  },
  league: {
    id: leagueId,
    leagueId,
    level: 1,
    seasonsById: {
      '2026_2027': {
        seasonKey: '26/27',
        seasonStatus: 'active',
        gameDurationMinutes: 80,
        table: { teamsById: {
          'club-1_2011_1': {
            clubId: leagueClubId,
            officialTable: { teamGamePlayed: 8, goalsFor: 10, goalsAgainst: 4, rank: 1 },
          },
        } },
      },
    },
  },
  clubDirectoryEntry: {
    names: { display: 'Club 1', short: 'Club' },
    clubLevel: 2,
    clubStrengthLevel: 3,
  },
  playerRootsById: {},
  playerSeasonsById: {},
  playerSearchIndexesById: {},
  existingCounterpartTeamSeasonsById,
})

const incomingPlayers = [
  { externalPlayerId: '10000', games: 8, goals: 1, yellowCards: 0, minutes: 500, starts: 6, substituteIn: 2, substitutedOut: 1 },
  { externalPlayerId: '10001', games: 2, goals: 0, yellowCards: 0, minutes: 80, starts: 1, substituteIn: 1, substitutedOut: 0 },
]

describe('buildStatsLoadApprovedState', () => {
  beforeEach(() => {
    mockBuildScoutProfilesSummary.mockImplementation(rows => ({ playerCount: rows.length }))
    mockBuildPlayerLineClassificationState.mockReturnValue({ line: 'midfield' })
    mockBuildPlayerScoutState.mockReturnValue({
      scoutProfiles: [],
      scoutProfileHierarchy: {},
      scoutEvidence: {},
      scoutProfileProgression: {},
    })
    mockBuildTeamBalanceState.mockImplementation(({ seasonDocument }) => ({
      includedPlayerIds: seasonDocument.teamPlayers.map(player => player.playerId),
      teamTaskSignals: { offense: false, defense: false },
      scoutInterpretation: { availability: 'available', availabilityReason: '' },
    }))
    mockBuildTeamPlayerScoutProjection.mockReturnValue({
      primaryScoutProfileId: '',
      professionalScoutProfileIds: [],
      preliminaryScoutProfileIds: [],
      scoutEffectiveImmediacyStatus: '',
      scoutPlayerInterestLevel: '',
    })
  })

  test('calculates personal scouting for left players while keeping them outside Balance scope', () => {
    const approved = buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers,
      sources: sources(),
    })

    expect(approved.canonicalTeamSeason.stats.playersById[leftPlayerId].statsStatus).toBe('loaded')
    expect(approved.canonicalTeamSeason.scouting.playersById[leftPlayerId]).toBeDefined()
    expect(approved.canonicalTeamSeason.stats.teamBalance.includedPlayerIds).toEqual([playerId])
  })

  test('distinguishes an existing Player Season document from an existing team context', () => {
    const currentSources = sources()
    currentSources.playerSeasonsById[playerId] = {
      teamsById: { 'club-2_2011_1': { teamSeasonDocumentId: 'other' } },
    }
    currentSources.playerSeasonsById[leftPlayerId] = {
      teamsById: { 'club-1_2011_1': { teamSeasonDocumentId: 'current' } },
    }

    const approved = buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers,
      sources: currentSources,
    })

    expect(approved.playerSeasonPlans.find(plan => plan.playerId === playerId))
      .toMatchObject({ exists: true, teamExists: false })
    expect(approved.playerSeasonPlans.find(plan => plan.playerId === leftPlayerId))
      .toMatchObject({ exists: true, teamExists: true })
  })

  test('does not require a ClubProfile or a directory entry to approve Stats Load', () => {
    const approved = buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers,
      sources: {
        ...sources(),
        clubDirectoryEntry: null,
      },
    })

    expect(approved.canonicalTeamSeason.stats.statsLoadState.status).toBe('loaded')
  })

  test('passes verified player roles and League performance to Team Balance', () => {
    const currentSources = sources()
    currentSources.playerRootsById[playerId] = {
      primaryPosition: 'GK',
      positionLayer: 'goalkeeper',
    }
    currentSources.league.seasonsById['2026_2027']
      .table.teamsById['club-1_2011_1'].performance = {
        offense: { priorityLevel: 'elite' },
        defense: { priorityLevel: 'high' },
      }

    buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers,
      sources: currentSources,
    })

    const balanceInput = mockBuildTeamBalanceState.mock.calls.at(-1)[0].seasonDocument
    const goalkeeper = balanceInput.teamPlayers.find(player => player.playerId === playerId)
    expect(goalkeeper.primaryPosition).toBe('GK')
    expect(goalkeeper.positionLayer).toBe('goalkeeper')
    expect(balanceInput.performance).toEqual({
      offense: { priorityLevel: 'elite' },
      defense: { priorityLevel: 'high' },
    })
  })

  test('rejects a resolved playerId that differs from the canonical external identity', () => {
    expect(() => buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers: [{
        ...incomingPlayers[0],
        playerId: 'player__2011__99999',
      }],
      sources: sources(),
    })).toThrow('Stats participant playerId does not match canonical identity')
  })

  test('rebuilds projection-only Approved State from the current canonical Team Season', () => {
    const currentSources = sources()
    const loadState = buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers,
      sources: currentSources,
    })

    const repairState = buildStatsProjectionRepairApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      sources: {
        ...currentSources,
        teamSeason: loadState.canonicalTeamSeason,
      },
    })

    expect(repairState.canonicalTeamSeason).toBeUndefined()
    expect(repairState.counterpartPatches).toBeUndefined()
    expect(repairState.playerSeasonPlans).toHaveLength(2)
    expect(repairState.playerSearchIndexPlans).toHaveLength(2)
    expect(repairState.leagueProjection.patch.stats).toEqual({
      hasStats: true,
      statsComplete: true,
    })
  })

  test('routes a non-roster Stats participant through the Roster Movement contract', () => {
    const incoming = [
      ...incomingPlayers,
      {
        externalPlayerId: '10002',
        fullName: 'Joined',
        games: 1,
        goals: 0,
        yellowCards: 0,
        minutes: 20,
        starts: 0,
        substituteIn: 1,
        substitutedOut: 0,
        statsMovementDecision: 'joined',
        statsMovementTeam: {
          teamId: 'club-2_2011_1',
          clubId: 'club-2',
          teamSlot: 1,
          teamSeasonDocumentId: 'club-2_2011_1__2026_2027',
        },
      },
    ]

    const approved = buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers: incoming,
      sources: sources(),
    })

    const joinedPlayerId = 'player__2011__10002'
    expect(approved.canonicalTeamSeason.roster.playersById[joinedPlayerId].rosterStatus).toBe('regular')
    expect(Object.values(approved.canonicalTeamSeason.movement.transfersInById)).toEqual([
      expect.objectContaining({
        playerId: joinedPlayerId,
        fromTeamId: 'club-2_2011_1',
        toTeamId: 'club-1_2011_1',
      }),
    ])
    expect(approved.rosterParticipationPatch).toEqual(expect.objectContaining({
      teamSeasonDocumentId: 'club-1_2011_1__2026_2027',
    }))
    expect(approved.counterpartPatches).toEqual([])
  })

  test('requires an explicit Roster decision for a Stats participant outside the roster', () => {
    expect(() => buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers: [
        ...incomingPlayers,
        { externalPlayerId: '10002', games: 1, goals: 0, yellowCards: 0, minutes: 20, starts: 0, substituteIn: 1, substitutedOut: 0 },
      ],
      sources: sources(),
    })).toThrow('requires an explicit Roster Movement decision')
  })

  test('builds the parallel counterpart patch when the other Team Season exists', () => {
    const counterpartId = 'club-2_2011_1__2026_2027'
    const approved = buildStatsLoadApprovedState({
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers: [
        ...incomingPlayers,
        {
          externalPlayerId: '10002',
          fullName: 'Joined',
          games: 1,
          goals: 0,
          yellowCards: 0,
          minutes: 20,
          starts: 0,
          substituteIn: 1,
          substitutedOut: 0,
          statsMovementDecision: 'joined',
          statsMovementTeam: {
            teamId: 'club-2_2011_1',
            clubId: 'club-2',
            teamSlot: 1,
            teamSeasonDocumentId: counterpartId,
          },
        },
      ],
      sources: sources({
        existingCounterpartTeamSeasonsById: {
          [counterpartId]: {
            identity: { teamSeasonDocumentId: counterpartId },
            movement: {},
          },
        },
      }),
    })

    expect(approved.counterpartPatches).toEqual([
      expect.objectContaining({ documentId: counterpartId }),
    ])
    expect(Object.keys(approved.counterpartPatches[0].movement.transfersOutById)).toHaveLength(1)
  })

  test('rejects League identity or League team clubId mismatches before Approved State', () => {
    expect(() => buildStatsLoadApprovedState({
      leagueId: 'league-1', teamId: 'club-1_2011_1', seasonId: '2026_2027', incomingPlayers, sources: sources({ teamSeasonLeagueId: 'league-2' }),
    })).toThrow('League identity does not match Team Season')

    expect(() => buildStatsLoadApprovedState({
      leagueId: 'league-1', teamId: 'club-1_2011_1', seasonId: '2026_2027', incomingPlayers, sources: sources({ leagueClubId: 'club-2' }),
    })).toThrow('League team clubId does not match Team Season')
  })
})
