// src/features/playersDatabase/services/write/shared/manualEdit.write.test.js

import { executeManualEdit } from './manualEdit.write.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))

jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
  trackedGetDocsFromServer: jest.fn(),
  trackedRunTransaction: jest.fn(),
}))

test('manual edit creates a missing canonical document and updates its projections atomically', async () => {
  const rootRef = { path: 'playerRoots/player-a' }
  const indexRef = { path: 'playerSearchIndexes/index-a' }
  const transaction = {
    get: jest.fn(async ref => ({ exists: () => ref.path !== rootRef.path })),
    set: jest.fn(),
    update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback(transaction))

  const result = await executeManualEdit({
    refs: [rootRef, indexRef],
    build: ({ get }) => {
      expect(get(rootRef).exists()).toBe(false)
      return [
        { ref: rootRef, document: { identity: { playerId: 'player-a' } } },
        { ref: indexRef, patch: { player: { primaryPosition: 'CB' } } },
      ]
    },
  })

  expect(transaction.set).toHaveBeenCalledWith(rootRef, {
    identity: { playerId: 'player-a' },
  })
  expect(transaction.update).toHaveBeenCalledWith(indexRef, expect.objectContaining({
    player: { primaryPosition: 'CB' },
    updatedAt: expect.any(String),
  }))
  expect(result).toEqual({ completed: true, changedCount: 2 })
})
