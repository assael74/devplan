// src/features/playersDatabase/services/read/pages/clubs.read.test.js

import {
  doc,
  onSnapshot,
} from 'firebase/firestore'

import {
  clearPlayersDatabaseDocumentCache,
  getDocumentCacheEntry,
} from '../../cache/index.js'
import {
  CLUBS_DIRECTORY_STORE_KEY,
  subscribeClubsDirectoryDocument,
} from './clubs.read.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackFirestoreListenerClose: jest.fn(),
  trackFirestoreListenerOpen: jest.fn(),
  trackFirestoreListenerUpdate: jest.fn(),
  trackedGetDoc: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  clearPlayersDatabaseDocumentCache()
  doc.mockImplementation((_db, collectionName, documentId) => ({
    path: `${collectionName}/${documentId}`,
  }))
})

test('stores the global Clubs Directory snapshot and unsubscribes', () => {
  const unsubscribe = jest.fn()
  let emitSnapshot
  onSnapshot.mockImplementation((_reference, onValue) => {
    emitSnapshot = onValue
    return unsubscribe
  })

  const stop = subscribeClubsDirectoryDocument()
  emitSnapshot({
    id: 'all',
    exists: () => true,
    data: () => ({
      clubsById: {
        'club-1': { clubUrl: 'https://example.test/club-1' },
      },
    }),
    metadata: { fromCache: false },
  })

  expect(getDocumentCacheEntry(CLUBS_DIRECTORY_STORE_KEY)).toMatchObject({
    hit: true,
    value: {
      documentExists: true,
      clubsById: {
        'club-1': { clubUrl: 'https://example.test/club-1' },
      },
    },
  })

  stop()
  expect(unsubscribe).toHaveBeenCalledTimes(1)
})
