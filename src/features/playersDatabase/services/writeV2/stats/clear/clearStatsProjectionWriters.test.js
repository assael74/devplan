// src/features/playersDatabase/services/writeV2/stats/clear/clearStatsProjectionWriters.test.js

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'
import { writeClearStatsProjectionsV2 } from './clearStatsProjectionWriters.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  updateDoc: jest.fn(),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
}))

const snapshot = data => ({
  exists: () => true,
  data: () => data,
})

const operation = ({ docId, sourceFields, setFields, action = 'update' }) => ({
  target: { docId },
  action,
  sourceFields,
  setFields,
  unsetFields: [],
})

const approvedState = projectionPlan => ({
  stateType: 'clearStatsApprovedState',
  stateVersion: 1,
  flowType: 'stats',
  operationType: 'clear',
  label: 'CLEAR_STATS',
  projectionPlan: {
    planVersion: 1,
    playerDocumentOperations: [],
    playerSearchIndexOperations: [],
    teamSearchIndexOperation: null,
    leagueOperation: null,
    clubOperations: [],
    clubsMasterOperation: null,
    ...projectionPlan,
  },
})

beforeEach(() => {
  jest.clearAllMocks()
  doc.mockImplementation((db, collectionName, id) => ({ collectionName, id }))
  serverTimestamp.mockImplementation(() => 'SERVER_TIMESTAMP')
})

describe('writeClearStatsProjectionsV2', () => {
  test('accepts only a Clear Stats Approved State', async () => {
    await expect(writeClearStatsProjectionsV2({
      projectionPlan: { planVersion: 1 },
    })).rejects.toMatchObject({ code: 'CLEAR_STATS_APPROVED_STATE_INVALID' })

    expect(trackedGetDocFromServer).not.toHaveBeenCalled()
    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('does not read or write skipped operations', async () => {
    const result = await writeClearStatsProjectionsV2({
      approvedState: approvedState({
        playerDocumentOperations: [operation({
          docId: 'player-1',
          action: 'skip',
          sourceFields: {},
          setFields: {},
        })],
      }),
    })

    expect(result).toEqual(expect.objectContaining({
      writesAttempted: 0,
      writesCompleted: 0,
      writesSkipped: 1,
    }))
    expect(trackedGetDocFromServer).not.toHaveBeenCalled()
    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('uses a server read, checks sourceFields and writes setFields with updatedAt', async () => {
    trackedGetDocFromServer.mockResolvedValue(snapshot({ current: [{ value: 1 }], untouched: true }))
    const setFields = { current: [{ value: 2 }] }

    const result = await writeClearStatsProjectionsV2({
      approvedState: approvedState({
        playerDocumentOperations: [operation({
          docId: 'player-1',
          sourceFields: { current: [{ value: 1 }] },
          setFields,
        })],
      }),
    })

    expect(doc).toHaveBeenCalledWith({}, 'dbPlayers', 'player-1')
    expect(trackedGetDocFromServer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ operationSubtype: 'write-precondition-getDoc' })
    )
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: 'dbPlayers', id: 'player-1' }),
      {
        ...setFields,
        updatedAt: 'SERVER_TIMESTAMP',
      }
    )
    expect(serverTimestamp).toHaveBeenCalledTimes(1)
    expect(result.writesCompleted).toBe(1)
  })

  test('records CLEAR_STATS metadata when Clubs Master is written', async () => {
    trackedGetDocFromServer.mockResolvedValue(snapshot({ clubs: [{ clubId: 'club-1' }] }))

    await writeClearStatsProjectionsV2({
      approvedState: approvedState({
        clubsMasterOperation: operation({
          docId: 'all',
          sourceFields: { clubs: [{ clubId: 'club-1' }] },
          setFields: { clubs: [{ clubId: 'club-1', cleared: true }] },
        }),
      }),
    })

    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: 'dbClubsMaster', id: 'all' }),
      {
        clubs: [{ clubId: 'club-1', cleared: true }],
        updatedAt: 'SERVER_TIMESTAMP',
        lastWriteAction: 'CLEAR_STATS',
        lastWriteAt: 'SERVER_TIMESTAMP',
      }
    )
  })

  test('stops on source mismatch without writing', async () => {
    trackedGetDocFromServer.mockResolvedValue(snapshot({ current: [{ value: 9 }] }))

    await expect(writeClearStatsProjectionsV2({
      approvedState: approvedState({
        playerDocumentOperations: [operation({
          docId: 'player-1',
          sourceFields: { current: [{ value: 1 }] },
          setFields: { current: [{ value: 2 }] },
        })],
      }),
    })).rejects.toMatchObject({
      code: 'CLEAR_STATS_PROJECTION_SOURCE_MISMATCH',
      projectionWrite: expect.objectContaining({
        writesAttempted: 1,
        writesCompleted: 0,
      }),
    })

    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('detects a field added after approval when it was absent in sourceFields', async () => {
    trackedGetDocFromServer.mockResolvedValue(snapshot({ playersCount: 9 }))

    await expect(writeClearStatsProjectionsV2({
      approvedState: approvedState({
        teamSearchIndexOperation: operation({
          docId: 'team-index-1',
          sourceFields: {},
          setFields: { playersCount: 0 },
        }),
      }),
    })).rejects.toMatchObject({ code: 'CLEAR_STATS_PROJECTION_SOURCE_MISMATCH' })

    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('reports partial progress when a later target fails', async () => {
    trackedGetDocFromServer
      .mockResolvedValueOnce(snapshot({ current: [1] }))
      .mockResolvedValueOnce(snapshot({ current: [99] }))

    await expect(writeClearStatsProjectionsV2({
      approvedState: approvedState({
        playerDocumentOperations: [
          operation({ docId: 'player-1', sourceFields: { current: [1] }, setFields: { current: [2] } }),
          operation({ docId: 'player-2', sourceFields: { current: [3] }, setFields: { current: [4] } }),
        ],
      }),
    })).rejects.toMatchObject({
      projectionWrite: expect.objectContaining({
        writesAttempted: 2,
        writesCompleted: 1,
        targets: [expect.objectContaining({ docId: 'player-1', status: 'written' })],
        failedTarget: expect.objectContaining({
          targetType: 'playerDocument',
          docId: 'player-2',
          status: 'failed',
          code: 'CLEAR_STATS_PROJECTION_SOURCE_MISMATCH',
        }),
      }),
    })

    expect(updateDoc).toHaveBeenCalledTimes(1)
  })
})
