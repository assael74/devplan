// src/features/playersDatabase/domain/statsV2/approvedStatsState.builder.test.js

import { buildApprovedStatsState } from './approvedStatsState.builder.js'

const finalTeamSeason = {
  seasonStatus: 'active',
  playersCount: 0,
  playerOwnedPatches: [],
  approvedNewParticipants: [],
  localMovementPatch: null,
  teamBalance: { status: 'available' },
  teamScout: { players: [] },
  scoutProfilesSummary: { total: 0 },
  statsLoadState: { status: 'loaded' },
  finalTeamSeasonPreview: { id: 'team-1__2026-2027', teamPlayers: [] },
}

const baseInput = {
  identity: {
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026-2027',
    leagueId: 'league-1',
  },
  approvedAt: '2026-09-25T12:00:00.000Z',
  canonical: {
    teamRoot: { id: 'team-1' },
    teamSeason: { id: 'team-1__2026-2027' },
    league: {
      id: 'league-1',
      current: { seasonKey: '2026-2027', seasonStatus: 'active' },
      history: [],
    },
  },
  reloadDecisionState: {
    isComplete: true,
    resolved: [],
    unresolved: [],
  },
  teamSeason: finalTeamSeason,
  playerSearchIndexStates: [],
  teamSearchIndexPatch: { docId: 'team-index-1', fields: {} },
  leagueMetadataPatch: { fields: {} },
  leaguesMasterPatch: { id: 'all', leagues: [], summary: {} },
}

describe('approvedStatsState.builder', () => {
  test('keeps approved playersCount in the Approved State contract', () => {
    const state = buildApprovedStatsState(baseInput)

    expect(state.teamSeason.playersCount).toBe(0)
  })

  test('requires canonical Team Root, Team Season and League identities', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      canonical: {
        teamRoot: {},
        teamSeason: { id: 'season-1' },
        league: {
      id: 'league-1',
      current: { seasonKey: '2026-2027', seasonStatus: 'active' },
      history: [],
    },
      },
    })).toThrow('Canonical Team Root identity is required')
  })

  test('blocks approval while reload decisions are unresolved', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      reloadDecisionState: {
        isComplete: false,
        resolved: [],
        unresolved: [{ playerKey: 'player-1' }],
      },
    })).toThrow('Stats reload decisions are incomplete')
  })

  test('requires a complete final Team Season state', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      teamSeason: {
        ...finalTeamSeason,
        teamScout: null,
      },
    })).toThrow('Team Scout is required before Stats approval')
  })

  test('forbids Player Document deletion and unsupported skip', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      playerDocumentPlans: [{ action: 'delete', playerDocumentId: 'player-1' }],
    })).toThrow('Unsupported Stats V2 Player Document action: delete')

    expect(() => buildApprovedStatsState({
      ...baseInput,
      playerDocumentPlans: [{ action: 'skip', playerDocumentId: 'player-1' }],
    })).toThrow('Unsupported Stats V2 Player Document action: skip')
  })

  test('requires removeStats to be reflected without roster or Movement changes', () => {
    const previousPlayer = {
      playerId: 'player-1',
      statsStatus: 'loaded',
      playerStats: { games: 4, goals: 1 },
    }
    const reloadDecisionState = {
      missingPlayers: [{ playerKey: 'player-1', player: previousPlayer }],
      isComplete: true,
      resolved: [{ playerKey: 'player-1', player: previousPlayer, decision: 'removeStats' }],
      unresolved: [],
    }

    expect(() => buildApprovedStatsState({
      ...baseInput,
      reloadDecisionState,
    })).toThrow('removeStats is not reflected in final Team Season')

    const state = buildApprovedStatsState({
      ...baseInput,
      reloadDecisionState,
      teamSeason: {
        ...finalTeamSeason,
        playerOwnedPatches: [{
          playerKey: 'player-1',
          statsStatus: 'missing',
          playerStats: null,
        }],
      },
    })

    expect(state.teamSeason.playerOwnedPatches[0]).not.toHaveProperty('rosterStatus')
    expect(state.teamSeason.playerOwnedPatches[0]).not.toHaveProperty('movement')
  })

  test('derives seasonStatus from canonical League and rejects a mismatch', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      teamSeason: {
        ...finalTeamSeason,
        seasonStatus: 'completed',
      },
    })).toThrow('Final Team Season seasonStatus does not match canonical League')
  })

  test('requires reload decision coverage instead of trusting isComplete', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      reloadDecisionState: {
        missingPlayers: [{ playerKey: 'player-1', player: { playerId: 'player-1' } }],
        isComplete: true,
        resolved: [],
        unresolved: [],
      },
    })).toThrow('Stats reload decisions are incomplete')
  })

  test('rejects removeStats when meaningful Stats remain', () => {
    const previousPlayer = {
      playerId: 'player-1',
      statsStatus: 'loaded',
      playerStats: { games: 4, goals: 1 },
    }

    expect(() => buildApprovedStatsState({
      ...baseInput,
      reloadDecisionState: {
        missingPlayers: [{ playerKey: 'player-1', player: previousPlayer }],
        isComplete: true,
        resolved: [{ playerKey: 'player-1', player: previousPlayer, decision: 'removeStats' }],
        unresolved: [],
      },
      teamSeason: {
        ...finalTeamSeason,
        playerOwnedPatches: [{
          playerKey: 'player-1',
          statsStatus: 'missing',
          playerStats: { games: 4, goals: 1 },
        }],
      },
    })).toThrow('removeStats is not reflected in final Team Season')
  })

  test('requires preserveStats to remain unchanged in final Team Season', () => {
    const previousPlayer = {
      playerId: 'player-1',
      statsStatus: 'loaded',
      playerStats: { games: 4, goals: 1 },
    }
    const reloadDecisionState = {
      missingPlayers: [{ playerKey: 'player-1', player: previousPlayer }],
      isComplete: true,
      resolved: [{ playerKey: 'player-1', player: previousPlayer, decision: 'preserveStats' }],
      unresolved: [],
    }

    const state = buildApprovedStatsState({
      ...baseInput,
      reloadDecisionState,
      teamSeason: {
        ...finalTeamSeason,
        finalTeamSeasonPreview: {
          ...finalTeamSeason.finalTeamSeasonPreview,
          teamPlayers: [previousPlayer],
        },
      },
    })

    expect(state.reloadDecisions[0].decision).toBe('preserveStats')

    expect(() => buildApprovedStatsState({
      ...baseInput,
      reloadDecisionState,
      teamSeason: {
        ...finalTeamSeason,
        finalTeamSeasonPreview: {
          ...finalTeamSeason.finalTeamSeasonPreview,
          teamPlayers: [{
            ...previousPlayer,
            playerStats: { games: 0, goals: 0 },
          }],
        },
      },
    })).toThrow('preserveStats is not reflected in final Team Season')
  })

  test('builds a versioned approved state without concurrency metadata', () => {
    const state = buildApprovedStatsState({
      ...baseInput,
      playerDocumentPlans: [{ action: 'retain', playerDocumentId: 'player-1' }],
    })

    expect(state.planType).toBe('approvedStatsState')
    expect(state.planVersion).toBe(1)
    expect(state.teamSeason.seasonStatus).toBe('active')
    expect(state).not.toHaveProperty('sourceRevision')
    expect(state).not.toHaveProperty('sourceFingerprints')
    expect(state).not.toHaveProperty('operationId')
  })

  test('requires unique Player Document identities and owned patches before approval', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      playerDocumentPlans: [{ action: 'update', playerDocumentId: 'player-1' }],
    })).toThrow('Player Document owned patch is required before approval')

    expect(() => buildApprovedStatsState({
      ...baseInput,
      playerDocumentPlans: [
        { action: 'retain', playerDocumentId: 'player-1' },
        { action: 'retain', playerDocumentId: 'player-1' },
      ],
    })).toThrow('Player Document plan identity must be unique and complete')
  })

  test('normalizes counterpart Movement patches and rejects duplicate targets', () => {
    const state = buildApprovedStatsState({
      ...baseInput,
      counterpartMovementPatches: [{
        birthTeamDocumentId: 'team-2',
        seasonKey: '2026-2027',
        transfersOut: [{ movementId: 'm1' }],
      }],
    })

    expect(state.counterpartMovementPatches[0]).toEqual({
      birthTeamDocumentId: 'team-2',
      seasonKey: '2026-2027',
      transfersIn: [],
      transfersOut: [{ movementId: 'm1' }],
      pendingPlayers: [],
    })

    expect(() => buildApprovedStatsState({
      ...baseInput,
      counterpartMovementPatches: [
        { birthTeamDocumentId: 'team-2', seasonKey: '2026-2027' },
        { birthTeamDocumentId: 'team-2', seasonKey: '2026-2027' },
      ],
    })).toThrow('Duplicate counterpart Movement target')
  })

})
