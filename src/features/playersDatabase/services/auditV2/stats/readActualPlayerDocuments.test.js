// src/features/playersDatabase/services/auditV2/stats/readActualPlayerDocuments.test.js

jest.mock('firebase/firestore', () => ({
  doc: (db, collectionName, id) => ({ collectionName, id }),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({
  db: {},
}))

jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
}))

import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { readActualStatsPlayerDocumentsV2 } from './readActualPlayerDocuments.js'

describe('readActualStatsPlayerDocumentsV2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    trackedGetDocFromServer.mockResolvedValue({
      exists: () => false,
    })
  })

  test('checks Player Document existence with server-only reads', async () => {
    const rows = await readActualStatsPlayerDocumentsV2({
      expectedPlayerDocuments: [{
        playerDocumentId: 'player-10',
      }],
    })

    expect(trackedGetDocFromServer).toHaveBeenCalledWith(
      expect.objectContaining({
        collectionName: 'dbPlayers',
        id: 'player-10',
      }),
      expect.objectContaining({
        action: 'audit-v2-stats-read-player-document',
        operationSubtype: 'audit-getDoc',
      })
    )
    expect(rows).toEqual([{
      playerDocumentId: 'player-10',
      exists: false,
      document: null,
    }])
  })
})
