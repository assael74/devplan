// src/features/playersDatabase/services/auditV2/stats/clear/readClearStatsActual.test.js

import { trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'
import { readClearStatsActualV2 } from './readClearStatsActual.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
}))

const missing = { exists: () => false }

beforeEach(() => {
  jest.clearAllMocks()
  trackedGetDocFromServer.mockResolvedValue(missing)
})

describe('readClearStatsActualV2', () => {
  test('uses server-only reads for Canonical and every approved projection target', async () => {
    await readClearStatsActualV2({
      approvedState: {
        identity: {
          birthTeamDocumentId: 'team-1',
          seasonKey: '2026',
        },
        projectionPlan: {
          playerDocumentOperations: [{ target: { docId: 'player-1' } }],
          playerSearchIndexOperations: [{ target: { docId: 'player-index-1' } }],
          teamSearchIndexOperation: { target: { docId: 'team-index-1' } },
          leagueOperation: { target: { docId: 'league-1' } },
          clubOperations: [{ target: { docId: 'club-1' } }],
          clubsMasterOperation: { target: { docId: 'all' } },
        },
      },
    })

    expect(trackedGetDocFromServer).toHaveBeenCalledTimes(7)
    trackedGetDocFromServer.mock.calls.forEach(([, metadata]) => {
      expect(metadata).toEqual(expect.objectContaining({
        action: 'clear-stats-v2-audit-read',
        operationSubtype: 'audit-getDoc',
      }))
    })
  })
})
