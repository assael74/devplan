// src/features/playersDatabase/domain/statsV2/approvedStatsState.builder.test.js

import { buildApprovedStatsState } from './approvedStatsState.builder.js'
import { buildFinalStatsTeamSeasonState } from './teamSeasonStats.builder.js'

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
      current: {
        seasonKey: '2026-2027',
        seasonStatus: 'active',
        tableRank: [{ teamDocumentId: 'team-1' }],
      },
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
  teamSearchIndexPatch: { action: 'update', docId: 'team-index-1', fields: {} },
  leagueMetadataPatch: { fields: {} },
  leaguePatch: {
    leagueId: 'league-1',
    seasonKey: '2026-2027',
    target: 'current',
    tableRank: [{ teamDocumentId: 'team-1' }],
  },
  leaguesMasterPatch: { id: 'all', leagues: [], summary: {} },
  clubsMasterPatch: { id: 'all', baselineClubs: [], touchedClubIds: [], clubs: [] },
}

describe('approvedStatsState.builder', () => {
  test('keeps approved playersCount in the Approved State contract', () => {
    const state = buildApprovedStatsState(baseInput)

    expect(state.teamSeason.playersCount).toBe(0)
  })

  test('preserves Player SearchIndex action in the Approved State contract', () => {
    const state = buildApprovedStatsState({
      ...baseInput,
      playerSearchIndexStates: [{
        docId: 'player-index-1',
        action: 'update',
        fields: {},
      }],
    })

    expect(state.playerSearchIndexStates).toEqual([{
      docId: 'player-index-1',
      action: 'update',
      fields: {},
    }])
  })

  test('rejects Player SearchIndex without create/update action', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      playerSearchIndexStates: [{
        docId: 'player-index-1',
        fields: {},
      }],
    })).toThrow(expect.objectContaining({
      code: 'STATS_PLAYER_INDEX_ACTION_INVALID',
    }))
  })

  test('requires canonical Team Root, Team Season and League identities', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      canonical: {
        teamRoot: {},
        teamSeason: { id: 'season-1' },
        league: {
      id: 'league-1',
      current: {
        seasonKey: '2026-2027',
        seasonStatus: 'active',
        tableRank: [{ teamDocumentId: 'team-1' }],
      },
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
          setFields: {
            statsStatus: 'missing',
            playerStats: {
              games: 0,
              goals: 0,
            },
          },
          unsetFields: [],
        }],
      },
    })

    expect(state.teamSeason.playerOwnedPatches[0].setFields).not.toHaveProperty('rosterStatus')
    expect(state.teamSeason.playerOwnedPatches[0].setFields).not.toHaveProperty('movement')
  })

  test('accepts the player patch produced by buildFinalStatsTeamSeasonState', () => {
    const previousPlayer = {
      playerId: 'player-1',
      rosterStatus: 'active',
      statsStatus: 'loaded',
      playerStats: { games: 4, goals: 1 },
      scoutSignals: ['legacy'],
    }
    const canonical = {
      teamRoot: { id: 'team-1' },
      teamSeason: {
        id: 'team-1__2026-2027',
        seasonId: 'season-1',
        seasonKey: '2026-2027',
        teamPlayers: [previousPlayer],
      },
      league: baseInput.canonical.league,
    }
    const reloadDecisionState = {
      missingPlayers: [{ playerKey: 'player-1', player: previousPlayer }],
      isComplete: true,
      resolved: [{ playerKey: 'player-1', player: previousPlayer, decision: 'removeStats' }],
      unresolved: [],
    }
    const teamSeason = buildFinalStatsTeamSeasonState({
      canonical,
      season: {
        seasonId: 'season-1',
        seasonKey: '2026-2027',
      },
      team: {
        birthTeamDocumentId: 'team-1',
        teamDocumentId: 'team-1',
      },
      incomingPlayers: [],
      reloadDecisionState,
      statsLoadState: { status: 'loaded' },
    })

    expect(() => buildApprovedStatsState({
      ...baseInput,
      canonical,
      reloadDecisionState,
      teamSeason,
    })).not.toThrow()
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
          setFields: {
            statsStatus: 'missing',
            playerStats: { games: 4, goals: 1 },
          },
          unsetFields: [],
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

describe('approvedStatsState.builder League atomic payload validation', () => {
  test('rejects current tableRank that drops another canonical Team row', () => {
    const input = {
      ...baseInput,
      canonical: {
        ...baseInput.canonical,
        league: {
          ...baseInput.canonical.league,
          current: {
            ...baseInput.canonical.league.current,
            tableRank: [
              { teamDocumentId: 'team-1' },
              { teamDocumentId: 'team-2', points: 10 },
            ],
          },
        },
      },
      leaguePatch: {
        ...baseInput.leaguePatch,
        tableRank: [{ teamDocumentId: 'team-1' }],
      },
    }

    expect(() => buildApprovedStatsState(input)).toThrow(
      'Approved League tableRank must preserve the complete canonical array'
    )
  })

  test('rejects history payload that drops another canonical season', () => {
    const input = {
      ...baseInput,
      identity: { ...baseInput.identity, seasonKey: '2025-2026' },
      teamSeason: {
        ...finalTeamSeason,
        seasonStatus: 'completed',
      },
      canonical: {
        ...baseInput.canonical,
        league: {
          id: 'league-1',
          current: { seasonKey: '2026-2027', tableRank: [] },
          history: [
            { seasonKey: '2025-2026', tableRank: [{ teamDocumentId: 'team-1' }] },
            { seasonKey: '2024-2025', tableRank: [{ teamDocumentId: 'team-2' }] },
          ],
        },
      },
      leagueMetadataPatch: {
        seasonKey: '2025-2026',
        birthTeamDocumentId: 'team-1',
        fields: {},
      },
      leaguePatch: {
        leagueId: 'league-1',
        seasonKey: '2025-2026',
        target: 'history',
        history: [
          { seasonKey: '2025-2026', tableRank: [{ teamDocumentId: 'team-1' }] },
        ],
      },
    }

    expect(() => buildApprovedStatsState(input)).toThrow(
      'Approved League history must preserve the complete canonical array'
    )
  })

  test('rejects changing a non-Stats field on the approved Team row', () => {
    const input = {
      ...baseInput,
      canonical: {
        ...baseInput.canonical,
        league: {
          ...baseInput.canonical.league,
          current: {
            ...baseInput.canonical.league.current,
            tableRank: [
              { teamDocumentId: 'team-1', points: 12 },
              { teamDocumentId: 'team-2', points: 10 },
            ],
          },
        },
      },
      leaguePatch: {
        ...baseInput.leaguePatch,
        tableRank: [
          { teamDocumentId: 'team-1', points: 99 },
          { teamDocumentId: 'team-2', points: 10 },
        ],
      },
    }

    expect(() => buildApprovedStatsState(input)).toThrow(
      'Approved League tableRank changed data outside Stats ownership'
    )
  })

  test('rejects changing another history season without changing history length', () => {
    const canonicalHistory = [
      {
        seasonKey: '2025-2026',
        tableRank: [{ teamDocumentId: 'team-1', points: 12 }],
      },
      {
        seasonKey: '2024-2025',
        tableRank: [{ teamDocumentId: 'team-2', points: 10 }],
      },
    ]
    const input = {
      ...baseInput,
      identity: { ...baseInput.identity, seasonKey: '2025-2026' },
      teamSeason: {
        ...finalTeamSeason,
        seasonStatus: 'completed',
      },
      canonical: {
        ...baseInput.canonical,
        league: {
          id: 'league-1',
          current: { seasonKey: '2026-2027', tableRank: [] },
          history: canonicalHistory,
        },
      },
      leagueMetadataPatch: {
        seasonKey: '2025-2026',
        birthTeamDocumentId: 'team-1',
        fields: {},
      },
      leaguePatch: {
        leagueId: 'league-1',
        seasonKey: '2025-2026',
        target: 'history',
        history: [
          canonicalHistory[0],
          {
            seasonKey: '2024-2025',
            tableRank: [{ teamDocumentId: 'team-2', points: 99 }],
          },
        ],
      },
    }

    expect(() => buildApprovedStatsState(input)).toThrow(
      'Approved League history changed a season outside Stats ownership'
    )
  })


  test('rejects a Club atomic array that changes an untouched season', () => {
    const baselineSeason = { teamId: 'other-team', seasonKey: '25/26', points: 10 }
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubProjectionPatches: [{
        clubId: 'c1',
        baselineFields: {
          ageGroups: [{ ageGroupId: 'u15', seasons: [baselineSeason] }],
          competitionPaths: [],
        },
        touchedTargets: [{ ageGroupId: 'u15', seasonKey: '26/27', teamId: 'team-1' }],
        fields: {
          ageGroups: [{ ageGroupId: 'u15', seasons: [{ ...baselineSeason, points: 99 }] }],
          competitionPaths: [],
        },
      }],
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID' }))
  })

  test('rejects Clubs Master changes outside Stats ownership', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubProjectionPatches: [{
        clubId: 'c1',
        baselineFields: { ageGroups: [], competitionPaths: [] },
        touchedTargets: [],
        fields: { ageGroups: [], competitionPaths: [] },
      }],
      clubsMasterPatch: {
        id: 'all',
        baselineClubs: [{ clubId: 'c1', name: 'Old', manualNote: 'keep' }],
        touchedClubIds: ['c1'],
        clubs: [{ clubId: 'c1', name: 'New', manualNote: 'changed' }],
      },
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUBS_MASTER_ATOMIC_ARRAY_INVALID' }))
  })

  test('rejects a new Club season that is not a touched target', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubProjectionPatches: [{
        clubId: 'c1',
        baselineFields: { ageGroups: [], competitionPaths: [] },
        touchedTargets: [{ ageGroupId: 'u15', seasonKey: '26/27', teamId: 'team-1' }],
        fields: {
          ageGroups: [{
            ageGroupId: 'u14',
            ageGroupLabel: 'U14',
            seasons: [{ teamId: 'other-team', seasonKey: '26/27' }],
          }],
          competitionPaths: [],
        },
      }],
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID' }))
  })

  test('rejects age-group metadata changes outside the touched target', () => {
    const baselineSeason = { teamId: 'team-1', seasonKey: '26/27' }
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubProjectionPatches: [{
        clubId: 'c1',
        baselineFields: {
          ageGroups: [{ ageGroupId: 'u15', ageGroupLabel: 'נערים ג', seasons: [baselineSeason] }],
          competitionPaths: [],
        },
        touchedTargets: [{ ageGroupId: 'u15', seasonKey: '26/27', teamId: 'team-1' }],
        fields: {
          ageGroups: [{ ageGroupId: 'u15', ageGroupLabel: 'Changed', seasons: [baselineSeason] }],
          competitionPaths: [],
        },
      }],
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID' }))
  })

  test('rejects a new Clubs Master entry outside touched Club projections', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubsMasterPatch: {
        id: 'all',
        baselineClubs: [],
        touchedClubIds: [],
        clubs: [{
          clubId: 'c-new',
          externalClubId: '',
          clubUrl: '',
          name: 'Unexpected',
          shortName: '',
          clubLevel: 0,
          clubStrengthLevel: 0,
          ageGroups: [],
          competitionPaths: [],
          updatedAt: null,
        }],
      },
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUBS_MASTER_ATOMIC_ARRAY_INVALID' }))
  })

  test('rejects touched Clubs Master entry without matching Club projection patch', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubsMasterPatch: {
        id: 'all',
        baselineClubs: [{ clubId: 'c1', name: 'Club 1', ageGroups: [], competitionPaths: [] }],
        touchedClubIds: ['c1'],
        clubs: [{ clubId: 'c1', name: 'Club 1', ageGroups: [], competitionPaths: [] }],
      },
      clubProjectionPatches: [],
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUBS_MASTER_TARGETS_MISMATCH' }))
  })

  test('rejects incomplete new Clubs Master Catalog entry', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubProjectionPatches: [{
        clubId: 'c-new',
        baselineFields: { ageGroups: [], competitionPaths: [] },
        touchedTargets: [],
        fields: { ageGroups: [], competitionPaths: [] },
      }],
      clubsMasterPatch: {
        id: 'all',
        baselineClubs: [],
        touchedClubIds: ['c-new'],
        clubs: [{ clubId: 'c-new', name: 'Incomplete', ageGroups: [], competitionPaths: [] }],
      },
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUBS_MASTER_CREATE_INVALID' }))
  })

  test('rejects duplicate Club atomic identities before Map comparison', () => {
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubProjectionPatches: [{
        clubId: 'c1',
        baselineFields: { ageGroups: [], competitionPaths: [] },
        touchedTargets: [],
        fields: {
          ageGroups: [
            { ageGroupId: 'u15', seasons: [] },
            { ageGroupId: 'u15', seasons: [] },
          ],
          competitionPaths: [],
        },
      }],
      clubsMasterPatch: {
        id: 'all',
        baselineClubs: [],
        touchedClubIds: ['c1'],
        clubs: [{
          clubId: 'c1', externalClubId: '', clubUrl: '', name: 'Club 1', shortName: '',
          clubLevel: 0, clubStrengthLevel: 0, ageGroups: [], competitionPaths: [], updatedAt: null,
        }],
      },
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID' }))
  })

  test('rejects duplicate season and competition-path identities', () => {
    const duplicateSeason = { ageGroupId: 'u15', seasonKey: '26/27', teamId: 'team-1' }
    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubProjectionPatches: [{
        clubId: 'c1',
        baselineFields: { ageGroups: [], competitionPaths: [] },
        touchedTargets: [{ ageGroupId: 'u15', seasonKey: '26/27', teamId: 'team-1' }],
        fields: {
          ageGroups: [{ ageGroupId: 'u15', seasons: [duplicateSeason, duplicateSeason] }],
          competitionPaths: [],
        },
      }],
      clubsMasterPatch: {
        id: 'all', baselineClubs: [], touchedClubIds: ['c1'],
        clubs: [{ clubId: 'c1', externalClubId: '', clubUrl: '', name: 'Club 1', shortName: '', clubLevel: 0, clubStrengthLevel: 0, ageGroups: [], competitionPaths: [], updatedAt: null }],
      },
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID' }))

    expect(() => buildApprovedStatsState({
      ...baseInput,
      clubProjectionPatches: [{
        clubId: 'c1',
        baselineFields: { ageGroups: [], competitionPaths: [] },
        touchedTargets: [],
        fields: {
          ageGroups: [],
          competitionPaths: [{ birthYear: 2012, seasons: [] }, { birthYear: 2012, seasons: [] }],
        },
      }],
      clubsMasterPatch: {
        id: 'all', baselineClubs: [], touchedClubIds: ['c1'],
        clubs: [{ clubId: 'c1', externalClubId: '', clubUrl: '', name: 'Club 1', shortName: '', clubLevel: 0, clubStrengthLevel: 0, ageGroups: [], competitionPaths: [], updatedAt: null }],
      },
    })).toThrow(expect.objectContaining({ code: 'STATS_CLUB_PATCH_ATOMIC_ARRAY_INVALID' }))
  })

})
