// src/features/playersDatabase/services/write/stats/writeStatsPlayerSearchIndexes.test.js

import { writeStatsPlayerSearchIndexes } from './writeStatsPlayerSearchIndexes.js'

const mockSetDoc = jest.fn()
const mockDoc = jest.fn((db, collection, documentId) => ({ db, collection, documentId }))

jest.mock('firebase/firestore', () => ({
  doc: (...args) => mockDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: { id: 'db' } }))

jest.mock('../../../constants/pdb.constants.js', () => ({
  PLAYERS_DATABASE_COLLECTIONS: { searchIndexes: 'dbSearchIndexes' },
}))

describe('writeStatsPlayerSearchIndexes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSetDoc.mockResolvedValue(undefined)
  })

  test('writes the complete deterministic SearchIndex projection without reading it first', async () => {
    await writeStatsPlayerSearchIndexes({
      approvedState: {
        playerSearchIndexPlans: [{
          projection: {
            documentId: 'index-1',
            expectedLevelDelta: 1,
            scoutEffectiveImmediacyStatus: 'available',
            scoutProfileIds: ['p1'],
            scoutCombinationIds: [],
            scoutProfileSearchIds: ['p1'],
            player: { statsStatus: 'loaded' },
            stats: { games: 3 },
            scout: { primaryProfileId: 'p1' },
            scoutEvidence: { capturedAt: '2026-10-02T10:00:00.000Z' },
            updatedAt: '2026-10-02T10:00:00.000Z',
          },
        }],
      },
    })

    const [, data, options] = mockSetDoc.mock.calls[0]
    expect(data.player).toEqual({ statsStatus: 'loaded' })
    expect(data.documentId).toBeUndefined()
    expect(options).toBeUndefined()
  })
})
