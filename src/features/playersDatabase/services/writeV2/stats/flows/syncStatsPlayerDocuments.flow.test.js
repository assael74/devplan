// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsPlayerDocuments.flow.test.js

import {
  doc,
  setDoc,
} from 'firebase/firestore'

import {
  trackedGetDocFromServer,
} from '../../../../../../services/firestore/usage/index.js'

import {
  APPROVED_STATS_STATE_VERSION,
  buildApprovedStatsState,
} from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { syncStatsPlayerDocumentsV2 } from './syncStatsPlayerDocuments.flow.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
}))

const snapshot = ({ exists = true, data = {} } = {}) => ({
  exists: () => exists,
  data: () => data,
})

const approvedState = plans => ({
  planType: 'approvedStatsState',
  planVersion: APPROVED_STATS_STATE_VERSION,
  playerDocumentPlans: plans,
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
})

const seasonRow = (overrides = {}) => ({
  seasonKey: '2026-2027',
  seasonStatus: 'active',
  statsStatus: 'loaded',
  playerStats: { games: 4, goals: 1 },
  scoutProfiles: [],
  ...overrides,
})

const fullApprovedState = plans => buildApprovedStatsState({
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
    missingPlayers: [],
    resolved: [],
    unresolved: [],
  },
  teamSeason: {
    seasonStatus: 'active',
    playersCount: 1,
    playerOwnedPatches: [],
    approvedNewParticipants: [],
    localMovementPatch: null,
    teamBalance: { status: 'available' },
    teamScout: { players: [] },
    scoutProfilesSummary: { total: 0 },
    statsLoadState: { status: 'loaded' },
    finalTeamSeasonPreview: { id: 'team-1__2026-2027', teamPlayers: [] },
  },
  playerDocumentPlans: plans,
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
})

beforeEach(() => {
  jest.clearAllMocks()
  doc.mockImplementation((db, collectionName, id) => ({ collectionName, id }))
})

describe('syncStatsPlayerDocumentsV2', () => {
  test('preflight reads Player Document from server before changed/skipped decision', async () => {
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({
      data: {
        current: [
          {
            seasonKey: '2026-2027',
            statsStatus: 'missing',
          },
        ],
      },
    }))

    await syncStatsPlayerDocumentsV2({
      approvedState: approvedState([{
        action: 'update',
        playerDocumentId: 'player-1',
        ownedPatch: {
          current: [seasonRow()],
        },
      }]),
    })

    expect(trackedGetDocFromServer).toHaveBeenCalledTimes(1)
    expect(setDoc).toHaveBeenCalledTimes(1)
  })

  test('creates from approved identity and season state only', async () => {
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({ exists: false }))

    await syncStatsPlayerDocumentsV2({
      approvedState: approvedState([{
        action: 'create',
        playerDocumentId: 'player-1',
        ownedPatch: {
          id: 'player-1',
          fullName: 'Player One',
          current: [seasonRow()],
        },
      }]),
    })

    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][0].collectionName).toBe('dbPlayers')
    expect(setDoc.mock.calls[0][1]).toMatchObject({
      id: 'player-1',
      fullName: 'Player One',
      current: [seasonRow()],
    })
  })

  test('rejects protected root fields instead of trusting the Approved State', async () => {
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({ data: { current: [] } }))

    await expect(syncStatsPlayerDocumentsV2({
      approvedState: approvedState([{
        action: 'update',
        playerDocumentId: 'player-1',
        ownedPatch: {
          tracking: { favorite: false },
          current: [seasonRow()],
        },
      }]),
    })).rejects.toMatchObject({ code: 'STATS_PLAYER_DOCUMENT_PATCH_SCOPE_INVALID' })

    expect(setDoc).not.toHaveBeenCalled()
  })

  test('merges the approved season without replacing other seasons or protected season fields', async () => {
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({
      data: {
        tracking: { favorite: true },
        current: [
          { seasonKey: '2025-2026', statsStatus: 'loaded', notes: 'keep old season' },
          { seasonKey: '2026-2027', statsStatus: 'missing', notes: 'manual note' },
        ],
      },
    }))

    await syncStatsPlayerDocumentsV2({
      approvedState: approvedState([{
        action: 'update',
        playerDocumentId: 'player-1',
        ownedPatch: { current: [seasonRow()] },
      }]),
    })

    expect(setDoc.mock.calls[0][1].current).toEqual([
      { seasonKey: '2025-2026', statsStatus: 'loaded', notes: 'keep old season' },
      expect.objectContaining({
        seasonKey: '2026-2027',
        statsStatus: 'loaded',
        notes: 'manual note',
      }),
    ])
    expect(setDoc.mock.calls[0][1]).not.toHaveProperty('tracking')
  })


  test('rejects protected fields inside a season patch', async () => {
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({ data: { current: [] } }))

    await expect(syncStatsPlayerDocumentsV2({
      approvedState: approvedState([{
        action: 'update',
        playerDocumentId: 'player-1',
        ownedPatch: {
          current: [seasonRow({ notes: 'must not be overwritten by Stats' })],
        },
      }]),
    })).rejects.toMatchObject({ code: 'STATS_PLAYER_DOCUMENT_PATCH_SCOPE_INVALID' })
  })

  test('repeated create skips when the already-created owned state is identical', async () => {
    const patch = {
      id: 'player-1',
      fullName: 'Player One',
      current: [seasonRow()],
    }
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({ data: patch }))

    const result = await syncStatsPlayerDocumentsV2({
      approvedState: approvedState([{
        action: 'create',
        playerDocumentId: 'player-1',
        ownedPatch: patch,
      }]),
    })

    expect(result.results[0]).toMatchObject({ status: 'unchanged', writeSkipped: true })
    expect(setDoc).not.toHaveBeenCalled()
  })

  test('repeated create still rejects an existing document with different owned state', async () => {
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({
      data: {
        id: 'player-1',
        fullName: 'Different Name',
        current: [seasonRow()],
      },
    }))

    await expect(syncStatsPlayerDocumentsV2({
      approvedState: approvedState([{
        action: 'create',
        playerDocumentId: 'player-1',
        ownedPatch: {
          id: 'player-1',
          fullName: 'Player One',
          current: [seasonRow()],
        },
      }]),
    })).rejects.toMatchObject({ code: 'STATS_PLAYER_DOCUMENT_ALREADY_EXISTS' })
  })

  test('retain performs no write', async () => {
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot())

    const result = await syncStatsPlayerDocumentsV2({
      approvedState: approvedState([{ action: 'retain', playerDocumentId: 'player-1' }]),
    })

    expect(result.retainedCount).toBe(1)
    expect(setDoc).not.toHaveBeenCalled()
  })

  test('preflights all plans before writing so a missing update target stops the step', async () => {
    trackedGetDocFromServer
      .mockResolvedValueOnce(snapshot({ exists: false }))
      .mockResolvedValueOnce(snapshot({ exists: false }))

    await expect(syncStatsPlayerDocumentsV2({
      approvedState: approvedState([
        {
          action: 'create',
          playerDocumentId: 'player-1',
          ownedPatch: { id: 'player-1', current: [seasonRow()] },
        },
        {
          action: 'update',
          playerDocumentId: 'player-2',
          ownedPatch: { current: [seasonRow()] },
        },
      ]),
    })).rejects.toMatchObject({ code: 'STATS_PLAYER_DOCUMENT_NOT_FOUND' })

    expect(setDoc).not.toHaveBeenCalled()
  })

  test('accepts a real buildApprovedStatsState result', async () => {
    const state = fullApprovedState([{
      action: 'update',
      playerDocumentId: 'player-1',
      ownedPatch: { current: [seasonRow()] },
    }])
    trackedGetDocFromServer.mockResolvedValueOnce(snapshot({
      data: { current: [{ seasonKey: '2026-2027', statsStatus: 'missing' }] },
    }))

    await syncStatsPlayerDocumentsV2({ approvedState: state })

    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][1].current[0]).toMatchObject({
      seasonKey: '2026-2027',
      statsStatus: 'loaded',
    })
  })
})
