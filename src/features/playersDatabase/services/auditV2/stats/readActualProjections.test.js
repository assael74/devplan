// src/features/playersDatabase/services/auditV2/stats/readActualProjections.test.js

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
import { readActualStatsProjectionsV2 } from './readActualProjections.js'

const missingSnapshot = {
  exists: () => false,
}

describe('readActualStatsProjectionsV2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    trackedGetDocFromServer.mockResolvedValue(missingSnapshot)
  })

  test('reads Player SearchIndexes directly by expected docId using server-only reads', async () => {
    await readActualStatsProjectionsV2({
      expected: {
        playerSearchIndexes: [{ docId: 'player-index-1' }],
        teamSearchIndex: { docId: 'team-index-1' },
      },
      canonical: {
        leagueId: 'league-1',
      },
    })

    expect(trackedGetDocFromServer).toHaveBeenCalledTimes(3)
    expect(trackedGetDocFromServer).toHaveBeenCalledWith(
      expect.objectContaining({
        collectionName: 'dbSearchIndexes',
        id: 'player-index-1',
      }),
      expect.objectContaining({
        action: 'audit-v2-stats-read-player-index',
        operationSubtype: 'audit-getDoc',
      })
    )

    for (const call of trackedGetDocFromServer.mock.calls) {
      expect(call[1]).toEqual(expect.objectContaining({
        operationSubtype: 'audit-getDoc',
      }))
    }
  })
})
