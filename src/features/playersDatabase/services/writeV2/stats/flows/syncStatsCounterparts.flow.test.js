import {
  getDoc,
  setDoc,
} from 'firebase/firestore'

import {
  APPROVED_STATS_STATE_VERSION,
  buildApprovedStatsState,
} from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { syncStatsCounterpartsV2 } from './syncStatsCounterparts.flow.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

const snapshot = ({ exists = true, data = {} } = {}) => ({
  exists: () => exists,
  data: () => data,
})

const approvedState = patches => ({
  planType: 'approvedStatsState',
  planVersion: APPROVED_STATS_STATE_VERSION,
  counterpartMovementPatches: patches,
})


const buildApprovedStateWithCounterpart = counterpartMovementPatches => buildApprovedStatsState({
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
    missingPlayers: [],
    isComplete: true,
    resolved: [],
    unresolved: [],
  },
  teamSeason: {
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
  },
  counterpartMovementPatches,
  playerSearchIndexStates: [],
  teamSearchIndexPatch: { docId: 'team-index-1', fields: {} },
  leagueMetadataPatch: { fields: {} },
  leaguesMasterPatch: { id: 'all', leagues: [], summary: {} },
})

beforeEach(() => jest.clearAllMocks())

describe('syncStatsCounterpartsV2', () => {
  test('updates Movement fields only on an existing counterpart Team Season', async () => {
    getDoc.mockResolvedValueOnce(snapshot({
      data: { teamPlayers: [{ playerId: 'p1' }], tableRank: 2 },
    }))

    await syncStatsCounterpartsV2({
      approvedState: approvedState([{
        birthTeamDocumentId: 'team-2',
        seasonKey: '2026-2027',
        transfersIn: [{ movementId: 'm1' }],
        transfersOut: [],
        pendingPlayers: [],
      }]),
    })

    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][1]).toMatchObject({
      transfersIn: [{ movementId: 'm1' }],
      transfersOut: [],
      pendingPlayers: [],
    })
    expect(setDoc.mock.calls[0][1]).not.toHaveProperty('teamPlayers')
    expect(setDoc.mock.calls[0][2]).toEqual({ merge: true })
  })

  test('writes counterpart Movement from a real Approved State', async () => {
    const state = buildApprovedStateWithCounterpart([{
      birthTeamDocumentId: 'team-2',
      seasonKey: '2026-2027',
      transfersOut: [{ movementId: 'm-approved' }],
    }])

    getDoc.mockResolvedValueOnce(snapshot({
      data: { transfersIn: [], transfersOut: [], pendingPlayers: [] },
    }))

    const result = await syncStatsCounterpartsV2({ approvedState: state })

    expect(result.updatedCount).toBe(1)
    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][1]).toMatchObject({
      transfersIn: [],
      transfersOut: [{ movementId: 'm-approved' }],
      pendingPlayers: [],
    })
    expect(setDoc.mock.calls[0][1]).not.toHaveProperty('teamPlayers')
    expect(setDoc.mock.calls[0][2]).toEqual({ merge: true })
  })

  test('reports a missing counterpart without creating it', async () => {
    getDoc.mockResolvedValueOnce(snapshot({ exists: false }))

    const result = await syncStatsCounterpartsV2({
      approvedState: approvedState([{
        birthTeamDocumentId: 'team-2',
        seasonKey: '2026-2027',
      }]),
    })

    expect(result.notFoundCount).toBe(1)
    expect(setDoc).not.toHaveBeenCalled()
  })

  test('skips an identical Movement patch', async () => {
    getDoc.mockResolvedValueOnce(snapshot({
      data: { transfersIn: [], transfersOut: [], pendingPlayers: [] },
    }))

    const result = await syncStatsCounterpartsV2({
      approvedState: approvedState([{
        birthTeamDocumentId: 'team-2',
        seasonKey: '2026-2027',
        transfersIn: [],
        transfersOut: [],
        pendingPlayers: [],
      }]),
    })

    expect(result.results[0].status).toBe('unchanged')
    expect(setDoc).not.toHaveBeenCalled()
  })
})
