jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collection, id) => ({ collection, id })),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TS'),
  setDoc: jest.fn(),
  writeBatch: jest.fn(),
}))
jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
}))
jest.mock('../../../read/entities/league.js', () => ({ getLeagueById: jest.fn() }))
jest.mock('../../../read/entities/teamMovementCounterpartV2.js', () => ({ resolveRosterCounterpartCandidateV2: jest.fn() }))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../cache/index.js', () => ({ invalidateClubsMasterDocumentCache: jest.fn() }))
jest.mock('../../../../domain/movement/index.js', () => ({ reconcileRosterMovement: jest.fn() }))
jest.mock('../../../../domain/statsV2/teamSeasonStats.builder.js', () => ({
  buildFinalStatsTeamSeasonState: jest.fn(),
  buildStatsScoutedPlayer: jest.fn(({ player }) => ({
    ...player,
    scoutProfiles: Array.isArray(player.scoutProfiles) ? player.scoutProfiles : [],
  })),
}))
jest.mock('../../../../domain/statsV2/statsReloadDecision.builder.js', () => ({ buildStatsReloadDecisionState: jest.fn() }))
jest.mock('../../../../domain/statsV2/approvedStatsState.builder.js', () => ({
  APPROVED_STATS_STATE_VERSION: 1,
  buildApprovedStatsState: jest.fn(input => ({ ...input, planType: 'approvedStatsState', planVersion: 1 })),
}))
jest.mock('../../../../domain/projections/teamBalanceSearchIndex.projection.js', () => ({ buildTeamBalanceSearchIndexProjection: jest.fn(() => ({})) }))
jest.mock('../../../../domain/projections/leaguesMaster.projection.js', () => ({
  buildLeaguesMasterLeagueEntry: jest.fn(() => ({ leagueId: 'l1' })),
  buildLeaguesMasterSummary: jest.fn(() => ({})),
  sortLeaguesMasterEntries: jest.fn(rows => rows),
}))
jest.mock('../../../../domain/projections/club/index.js', () => ({
  buildClubAgeGroupSeasonProjection: jest.fn(() => ({ ageGroupId: 'u15' })),
  buildClubDocumentProjection: jest.fn(({ existingClub }) => ({ ...existingClub, ageGroups: [], competitionPaths: [] })),
  buildClubsMasterClubProjection: jest.fn(({ club }) => ({
    clubId: club.clubId || club.id || '',
    externalClubId: club.externalClubId || '',
    clubUrl: club.clubUrl || '',
    name: club.name || '',
    shortName: club.shortName || '',
    clubLevel: Number(club.clubLevel || 0),
    clubStrengthLevel: Number(club.clubStrengthLevel || 0),
    ageGroups: [],
    competitionPaths: [],
    updatedAt: club.updatedAt || null,
  })),
}))
jest.mock('../../../../domain/projections/teamPerformance.projection.js', () => ({
  buildTeamPerformanceProjectionFromTableRows: jest.fn(() => ({ tableRank: 3 })),
  buildLeagueTeamPerformanceProjection: jest.fn(() => ({ tableRank: 3 })),
  getLeagueTableRowStats: jest.fn(row => ({
    points: Number(row?.points || 0),
  })),
  resolveLeagueSeasonStatus: jest.fn(),
  resolveLeagueTeamPoints: jest.fn(() => 12),
}))

import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore'
import { trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'
import { getLeagueById } from '../../../read/entities/league.js'
import { resolveRosterCounterpartCandidateV2 } from '../../../read/entities/teamMovementCounterpartV2.js'
import { reconcileRosterMovement } from '../../../../domain/movement/index.js'
import {
  buildFinalStatsTeamSeasonState,
  buildStatsScoutedPlayer,
} from '../../../../domain/statsV2/teamSeasonStats.builder.js'
import { buildStatsReloadDecisionState } from '../../../../domain/statsV2/statsReloadDecision.builder.js'
import { buildApprovedStatsState } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import {
  buildTeamPerformanceProjectionFromTableRows,
  buildLeagueTeamPerformanceProjection,
  getLeagueTableRowStats,
  resolveLeagueSeasonStatus,
  resolveLeagueTeamPoints,
} from '../../../../domain/projections/teamPerformance.projection.js'
import {
  buildClubAgeGroupSeasonProjection,
  buildClubDocumentProjection,
  buildClubsMasterClubProjection,
} from '../../../../domain/projections/club/index.js'
import { prepareStatsImportPlanV2, prepareStatsFinalSyncFromCanonicalV2 } from './prepareStatsImportPlanV2.js'
import { syncStatsClubsV2 } from '../flows/syncStatsClubs.flow.js'
import { syncStatsPlayerIndexesV2 } from '../flows/syncStatsPlayerIndexes.flow.js'

const snapshot = (id, data) => ({ exists: () => true, id, data: () => data })

const resetFirestoreAndClubProjectionMocks = () => {
  doc.mockImplementation((db, collection, id) => ({ collection, id }))
  buildTeamPerformanceProjectionFromTableRows.mockImplementation(() => ({ tableRank: 3 }))
  getLeagueTableRowStats.mockImplementation(row => ({
    points: Number(row?.points || 0),
  }))
  trackedGetDocFromServer.mockImplementation(async ref => ({
    exists: () => false,
    id: ref?.id,
    data: () => undefined,
  }))
  buildApprovedStatsState.mockImplementation(input => ({
    ...input,
    planType: 'approvedStatsState',
    planVersion: 1,
  }))
  buildStatsScoutedPlayer.mockImplementation(({ player }) => ({
    ...player,
    scoutProfiles: Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : [],
  }))
  buildClubAgeGroupSeasonProjection.mockReturnValue({ ageGroupId: 'u15' })
  buildClubDocumentProjection.mockImplementation(({ existingClub, ageGroupSeasonProjection }) => ({
    ...existingClub,
    ageGroups: [{ ageGroupId: ageGroupSeasonProjection.ageGroupId }],
    competitionPaths: [],
  }))
  buildClubsMasterClubProjection.mockImplementation(({ club }) => ({
    clubId: club.clubId || club.id || '',
    externalClubId: club.externalClubId || '',
    clubUrl: club.clubUrl || '',
    name: club.name || '',
    shortName: club.shortName || '',
    clubLevel: Number(club.clubLevel || 0),
    clubStrengthLevel: Number(club.clubStrengthLevel || 0),
    ageGroups: [],
    competitionPaths: [],
    updatedAt: club.updatedAt || null,
  }))
}

describe('prepareStatsImportPlanV2 counterpart clubs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetFirestoreAndClubProjectionMocks()
    getDoc.mockReset()
    buildStatsReloadDecisionState.mockReturnValue({ isComplete: true, missingPlayers: [], resolved: [] })
    reconcileRosterMovement.mockReturnValue({
      counterpartRequests: [{ counterpartBirthTeamDocumentId: 'bt2', counterpartSeasonKey: '2025-26' }],
    })
    buildFinalStatsTeamSeasonState.mockReturnValue({
      seasonStatus: 'completed',
      playersCount: 1,
      scoutProfilesSummary: {},
      teamBalance: {},
      finalTeamSeasonPreview: { teamPlayers: [] },
    })
    resolveRosterCounterpartCandidateV2.mockResolvedValue({
      birthTeamDocumentId: 'bt2',
      seasonKey: '2025-26',
      teamRoot: { id: 'bt2', clubId: 'c2', leagueId: 'l2', name: 'Counterpart' },
      teamSeason: { id: 'bt2__2025-26', seasonKey: '2025-26', seasonId: 's-old', leagueId: 'l2' },
    })
    getLeagueById.mockResolvedValue({ id: 'l2', current: { seasonKey: '2026-27' }, history: [{ seasonKey: '2025-26' }] })
    resolveLeagueSeasonStatus.mockReturnValue('completed')
    getDoc
      .mockResolvedValueOnce(snapshot('bt2__2025-26', { transfersIn: [], transfersOut: [], pendingPlayers: [] }))
      .mockResolvedValueOnce(snapshot('all', { id: 'all', leagues: [] }))
      .mockResolvedValueOnce(snapshot('all', { id: 'all', clubs: [{ clubId: 'c1' }, { clubId: 'c2' }] }))
      .mockResolvedValueOnce(snapshot('c1', { id: 'c1', clubId: 'c1', name: 'Local' }))
      .mockResolvedValueOnce(snapshot('c2', { id: 'c2', clubId: 'c2', name: 'Counterpart Club' }))
  })

  test('uses history performance and points for a completed counterpart season', async () => {
    await prepareStatsImportPlanV2({
      league: { id: 'l1', history: [{ seasonKey: '2025-26', tableRank: [{ birthTeamDocumentId: 'bt1' }] }] },
      season: { seasonKey: '2025-26', seasonId: 's-old', seasonStatus: 'completed', leagueId: 'l1' },
      team: { birthTeamDocumentId: 'bt1', clubId: 'c1', ageGroupId: 'u15', name: 'Local Team' },
      teamRoot: { id: 'bt1', clubId: 'c1' },
      teamSeason: { id: 'bt1__2025-26', seasonKey: '2025-26', teamPlayers: [] },
      incomingPlayers: [],
    })

    expect(buildLeagueTeamPerformanceProjection).toHaveBeenCalledWith(expect.objectContaining({
      target: 'history',
      season: expect.objectContaining({ seasonKey: '2025-26', seasonStatus: 'completed' }),
      team: expect.objectContaining({ birthTeamDocumentId: 'bt2' }),
    }))
    expect(resolveLeagueTeamPoints).toHaveBeenCalledWith(expect.objectContaining({ target: 'history' }))
  })
})


describe('prepareStatsImportPlanV2 -> syncStatsClubsV2 integration', () => {
  test('carries local and counterpart Club projections through Approved State into the clubs writer', async () => {
    jest.clearAllMocks()
    resetFirestoreAndClubProjectionMocks()
    getDoc.mockReset()
    buildStatsReloadDecisionState.mockReturnValue({ isComplete: true, missingPlayers: [], resolved: [] })
    reconcileRosterMovement.mockReturnValue({
      counterpartRequests: [{ counterpartBirthTeamDocumentId: 'bt2', counterpartSeasonKey: '2025-26' }],
    })
    buildFinalStatsTeamSeasonState.mockReturnValue({
      seasonStatus: 'completed',
      playersCount: 1,
      scoutProfilesSummary: {},
      teamBalance: {},
      finalTeamSeasonPreview: { teamPlayers: [] },
    })
    resolveRosterCounterpartCandidateV2.mockResolvedValue({
      birthTeamDocumentId: 'bt2',
      seasonKey: '2025-26',
      teamRoot: { id: 'bt2', clubId: 'c2', leagueId: 'l2', name: 'Counterpart' },
      teamSeason: { id: 'bt2__2025-26', seasonKey: '2025-26', seasonId: 's-old', leagueId: 'l2' },
    })
    getLeagueById.mockResolvedValue({ id: 'l2', current: { seasonKey: '2026-27' }, history: [{ seasonKey: '2025-26' }] })
    resolveLeagueSeasonStatus.mockReturnValue('completed')

    const docs = {
      'dbBirthTeamSeasons/bt2__2025-26': { transfersIn: [], transfersOut: [], pendingPlayers: [] },
      'dbLeaguesMaster/all': { id: 'all', leagues: [] },
      'dbClubsMaster/all': { id: 'all', clubs: [{ clubId: 'c1', name: 'Local', manualNote: 'keep' }] },
      'dbClubs/c1': { id: 'c1', clubId: 'c1', name: 'Local', ageGroups: [], competitionPaths: [] },
      'dbClubs/c2': { id: 'c2', clubId: 'c2', name: 'Counterpart Club', ageGroups: [], competitionPaths: [] },
    }
    getDoc.mockImplementation(async ref => {
      const value = docs[`${ref.collection}/${ref.id}`]
      return value
        ? { exists: () => true, id: ref.id, data: () => value }
        : { exists: () => false, id: ref.id, data: () => ({}) }
    })
    trackedGetDocFromServer.mockImplementation(async ref => {
      const value = docs[`${ref.collection}/${ref.id}`]
      return value
        ? { exists: () => true, id: ref.id, data: () => value }
        : { exists: () => false, id: ref.id, data: () => ({}) }
    })

    const approvedState = await prepareStatsImportPlanV2({
      league: { id: 'l1', history: [{ seasonKey: '2025-26', tableRank: [{ birthTeamDocumentId: 'bt1' }] }] },
      season: { seasonKey: '2025-26', seasonId: 's-old', seasonStatus: 'completed', leagueId: 'l1' },
      team: { birthTeamDocumentId: 'bt1', clubId: 'c1', ageGroupId: 'u15', name: 'Local Team' },
      teamRoot: { id: 'bt1' },
      teamSeason: { id: 'bt1__2025-26', seasonKey: '2025-26', teamPlayers: [] },
      incomingPlayers: [],
    })

    expect(approvedState.clubProjectionPatches.map(row => row.clubId).sort()).toEqual(['c1', 'c2'])
    expect(approvedState.clubsMasterPatch.clubs.map(row => row.clubId).sort()).toEqual(['c1', 'c2'])
    expect(approvedState.clubsMasterPatch.clubs.find(row => row.clubId === 'c1')).toEqual(expect.objectContaining({
      name: 'Local',
      manualNote: 'keep',
    }))
    expect(approvedState.clubsMasterPatch.clubs.find(row => row.clubId === 'c2')).toEqual({
      clubId: 'c2',
      externalClubId: '',
      clubUrl: '',
      name: 'Counterpart Club',
      shortName: '',
      clubLevel: 0,
      clubStrengthLevel: 0,
      ageGroups: [],
      competitionPaths: [],
      updatedAt: null,
    })

    const update = jest.fn()
    const commit = jest.fn().mockResolvedValue()
    writeBatch.mockReturnValue({ update, commit })
    const result = await syncStatsClubsV2({ approvedState })

    expect(result.updatedClubs).toBe(2)
    expect(update).toHaveBeenCalledTimes(3)
    expect(commit).toHaveBeenCalledTimes(1)
  })
})


describe('prepareStatsFinalSyncFromCanonicalV2', () => {
  test('prepares Counterparts without reading unrelated Stats targets', async () => {
    jest.clearAllMocks()
    resetFirestoreAndClubProjectionMocks()
    trackedGetDocFromServer.mockReset()
    trackedGetDocFromServer.mockImplementation(async ref => (
      ref.collection === 'dbBirthTeamSeasons' && ref.id === 'bt2__2026-27'
        ? snapshot(ref.id, {
            transfersIn: [],
            transfersOut: [],
            pendingPlayers: [],
          })
        : { exists: () => false, id: ref.id, data: () => undefined }
    ))

    const result = await prepareStatsFinalSyncFromCanonicalV2({
      canonical: {
        birthTeamDocumentId: 'bt1',
        seasonKey: '2026-27',
        leagueId: 'l1',
        teamRoot: { id: 'bt1', clubId: 'c1' },
        teamSeason: {
          seasonKey: '2026-27',
          transfersOut: [{
            movementId: 'm1',
            playerId: 'p1',
            toClubId: 'c2',
            toBirthTeamDocumentId: 'bt2',
          }],
          transfersIn: [],
        },
        league: { id: 'l1' },
      },
      stage: 'counterparts',
    })

    expect(result.counterpartMovementPatches).toHaveLength(1)
    expect(result.counterpartMovementPatches[0].transfersIn[0]).toEqual(
      expect.objectContaining({
        fromClubId: 'c1',
        toClubId: 'c2',
      })
    )
    expect(result).not.toHaveProperty('playerDocumentPlans')
    expect(result).not.toHaveProperty('leaguesMasterPatch')
    expect(result).not.toHaveProperty('clubsMasterPatch')
    expect(resolveLeagueSeasonStatus).not.toHaveBeenCalled()
    expect(trackedGetDocFromServer.mock.calls.every(([ref]) => (
      ref.collection === 'dbBirthTeamSeasons'
    ))).toBe(true)
  })

  test('prepares Player Documents repair without reading unrelated Masters or Clubs', async () => {
    jest.clearAllMocks()
    resetFirestoreAndClubProjectionMocks()
    trackedGetDocFromServer.mockReset()
    resolveLeagueSeasonStatus.mockReturnValue('active')
    trackedGetDocFromServer.mockImplementation(async ref => (
      ref.collection === 'dbPlayers' && ref.id === 'p1'
        ? snapshot('p1', { id: 'p1', current: [] })
        : { exists: () => false, id: ref.id, data: () => undefined }
    ))

    const result = await prepareStatsFinalSyncFromCanonicalV2({
      canonical: {
        birthTeamDocumentId: 'bt1',
        seasonKey: '2026-27',
        leagueId: 'l1',
        teamRoot: { id: 'bt1', clubId: 'c1', name: 'Local Team' },
        teamSeason: {
          seasonKey: '2026-27',
          leagueId: 'l1',
          teamPlayers: [{ playerDocumentId: 'p1', statsStatus: 'loaded' }],
        },
        league: { id: 'l1', current: { seasonKey: '2026-27' } },
        club: {
          id: 'c1',
          clubId: 'c1',
          name: 'Canonical Club',
          clubLevel: 2,
          clubStrengthLevel: 3,
        },
      },
      stage: 'playerDocuments',
    })

    expect(result.playerDocumentPlans).toHaveLength(1)
    expect(result.playerDocumentPlans[0].ownedPatch.current[0]).toEqual(
      expect.objectContaining({
        clubName: 'Canonical Club',
        clubLevel: 2,
        clubStrengthLevel: 3,
      })
    )
    expect(result).not.toHaveProperty('clubsMasterPatch')
    expect(trackedGetDocFromServer).toHaveBeenCalledTimes(1)
  })

  test('keeps a reconcile Player Document when scouting is derived only after projection', async () => {
    jest.clearAllMocks()
    resetFirestoreAndClubProjectionMocks()
    trackedGetDocFromServer.mockReset()
    resolveLeagueSeasonStatus.mockReturnValue('active')
    trackedGetDocFromServer.mockResolvedValue({
      exists: () => false,
      id: 'player-2012-p1',
      data: () => undefined,
    })
    buildStatsScoutedPlayer.mockImplementation(({ player }) => ({
      ...player,
      scoutProfiles: [{ profileId: 'derived-profile' }],
    }))

    const result = await prepareStatsFinalSyncFromCanonicalV2({
      canonical: {
        birthTeamDocumentId: 'bt1',
        seasonKey: '2026-27',
        leagueId: 'l1',
        teamRoot: { id: 'bt1', clubId: 'c1', name: 'Local Team' },
        teamSeason: {
          seasonKey: '2026-27',
          leagueId: 'l1',
          teamPlayers: [{
            playerId: 'p1',
            externalPlayerId: 'p1',
            fullName: 'Player One',
            birthYear: 2012,
            statsStatus: 'loaded',
            scoutProfiles: [],
          }],
        },
        league: { id: 'l1', current: { seasonKey: '2026-27' } },
        club: { id: 'c1', clubId: 'c1', name: 'Canonical Club' },
      },
      stage: 'playerDocuments',
    })

    expect(result.playerDocumentPlans).toHaveLength(1)
    expect(result.playerDocumentPlans[0].action).toBe('create')
  })

  test('rebuilds local Club performance and points from canonical League instead of Import defaults', async () => {
    jest.clearAllMocks()
    resetFirestoreAndClubProjectionMocks()
    trackedGetDocFromServer.mockReset()
    resolveLeagueSeasonStatus.mockReturnValue('active')
    buildLeagueTeamPerformanceProjection.mockReturnValue({
      tableRank: 2,
      goalsFor: 18,
      goalsAgainst: 7,
    })
    resolveLeagueTeamPoints.mockReturnValue(16)

    const docs = {
      'dbLeaguesMaster/all': { id: 'all', leagues: [] },
      'dbClubsMaster/all': { id: 'all', clubs: [] },
      'dbClubs/c1': {
        id: 'c1',
        clubId: 'c1',
        name: 'Local Club',
        ageGroups: [],
        competitionPaths: [],
      },
    }
    trackedGetDocFromServer.mockImplementation(async ref => {
      const value = docs[`${ref.collection}/${ref.id}`]
      return value
        ? snapshot(ref.id, value)
        : { exists: () => false, id: ref.id, data: () => undefined }
    })

    await prepareStatsFinalSyncFromCanonicalV2({
      canonical: {
        birthTeamDocumentId: 'bt1',
        seasonKey: '2026-27',
        leagueId: 'l1',
        teamRoot: {
          id: 'bt1',
          clubId: 'c1',
          ageGroupId: 'u15',
          birthYear: 2012,
          name: 'Local Team',
        },
        teamSeason: {
          id: 'bt1__2026-27',
          seasonKey: '2026-27',
          seasonId: '28',
          leagueId: 'l1',
          scoutProfilesSummary: {
            total: 0,
            profileCounts: {},
          },
          teamPlayers: [],
          transfersIn: [],
          transfersOut: [],
        },
        league: {
          id: 'l1',
          current: {
            seasonKey: '2026-27',
            tableRank: [{ birthTeamDocumentId: 'bt1' }],
          },
        },
      },
      approvedAt: 'reconcile',
    })

    expect(buildLeagueTeamPerformanceProjection).toHaveBeenCalledWith(expect.objectContaining({
      target: 'current',
      team: expect.objectContaining({ birthTeamDocumentId: 'bt1' }),
    }))
    expect(resolveLeagueTeamPoints).toHaveBeenCalledWith(expect.objectContaining({
      target: 'current',
      team: expect.objectContaining({ birthTeamDocumentId: 'bt1' }),
    }))
    expect(buildClubAgeGroupSeasonProjection).toHaveBeenCalledWith(
      expect.objectContaining({
        leagueScoutProfilesSummary: {
          total: 0,
          profileCounts: {},
        },
      })
    )
  })
})


describe('prepareStatsImportPlanV2 Player SearchIndex snapshots integration', () => {
  test('carries the server-read existing current snapshot into statsSnapshots.previous', async () => {
    jest.clearAllMocks()
    resetFirestoreAndClubProjectionMocks()
    getDoc.mockReset()
    trackedGetDocFromServer.mockReset()

    buildStatsReloadDecisionState.mockReturnValue({
      isComplete: true,
      missingPlayers: [],
      resolved: [],
      unresolved: [],
    })
    reconcileRosterMovement.mockReturnValue({ counterpartRequests: [] })

    const existingCurrent = {
      capturedAt: '2026-09-20T10:00:00.000Z',
      snapshotKey: '8|7|2|450|5|2|1',
      teamGamePlayed: 8,
      games: 7,
      goals: 2,
      minutes: 450,
      starts: 5,
      substituteIn: 2,
      substitutedOut: 1,
    }
    const finalPlayer = {
      playerId: 'player-1',
      externalPlayerId: '123',
      fullName: 'Player One',
      normalizedName: 'player one',
      playerDocumentId: '',
      scoutProfiles: [],
      statsStatus: 'loaded',
      playerStats: {
        games: 8,
        goals: 3,
        minutes: 500,
        starts: 6,
        substituteIn: 2,
        substitutedOut: 1,
      },
    }

    buildFinalStatsTeamSeasonState.mockReturnValue({
      seasonStatus: 'active',
      playersCount: 1,
      scoutProfilesSummary: {},
      teamBalance: {},
      finalTeamSeasonPreview: {
        teamPlayers: [finalPlayer],
        scoutProfilesSummary: {},
      },
    })
    resolveLeagueSeasonStatus.mockReturnValue('active')

    const docs = {
      'dbLeaguesMaster/all': { id: 'all', leagues: [] },
      'dbClubsMaster/all': { id: 'all', clubs: [{ clubId: 'c1', name: 'Local' }] },
      'dbClubs/c1': { id: 'c1', clubId: 'c1', name: 'Local', ageGroups: [], competitionPaths: [] },
    }
    getDoc.mockImplementation(async ref => {
      const value = docs[`${ref.collection}/${ref.id}`]
      return value
        ? { exists: () => true, id: ref.id, data: () => value }
        : { exists: () => false, id: ref.id, data: () => ({}) }
    })
    trackedGetDocFromServer.mockImplementation(async ref => (
      ref.collection === 'dbSearchIndexes'
        ? snapshot(ref.id, { statsSnapshots: { previous: null, current: existingCurrent } })
        : { exists: () => false, id: ref.id, data: () => ({}) }
    ))

    const approvedState = await prepareStatsImportPlanV2({
      league: {
        id: 'l1',
        current: {
          seasonKey: '26/27',
          tableRank: [{ birthTeamDocumentId: 'bt1' }],
        },
        history: [],
      },
      season: {
        seasonKey: '26/27',
        seasonId: '28',
        seasonStatus: 'active',
        leagueId: 'l1',
        birthYear: 2012,
        leagueTotalRound: 30,
      },
      team: {
        birthTeamDocumentId: 'bt1',
        ageGroupId: 'u15',
        birthYear: 2012,
        birthTeamSlot: 1,
        name: 'Local Team',
      },
      teamRoot: {
        id: 'bt1',
        clubId: 'c1',
      },
      teamSeason: {
        id: 'bt1__26_27',
        seasonKey: '26/27',
        teamPlayers: [],
      },
      incomingPlayers: [],
      approvedAt: '2026-09-27T10:00:00.000Z',
    })

    expect(getDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'dbClubs', id: 'c1' })
    )
    expect(
      approvedState.clubProjectionPatches.some(
        patch => patch.clubId === 'c1'
      )
    ).toBe(true)
    expect(approvedState.clubsMasterPatch.touchedClubIds).toContain('c1')
    expect(approvedState.playerSearchIndexStates).toHaveLength(1)
    expect(approvedState.playerSearchIndexStates[0].action).toBe('update')
    expect(approvedState.playerSearchIndexStates[0].fields.statsSnapshots.previous).toEqual(existingCurrent)

    await syncStatsPlayerIndexesV2({ approved: approvedState })

    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][1]).toEqual(expect.objectContaining({
      statsStatus: 'loaded',
      statsSnapshots: expect.objectContaining({
        previous: existingCurrent,
        current: expect.objectContaining({
          capturedAt: '2026-09-27T10:00:00.000Z',
        }),
      }),
      playerDocumentId: '',
      sourceCollection: 'dbBirthTeamSeasons',
      sourceDocumentId: 'bt1__26_27',
    }))
    expect(setDoc.mock.calls[0][2]).toEqual({ merge: true })
  })
})
