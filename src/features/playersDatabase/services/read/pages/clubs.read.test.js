// src/features/playersDatabase/services/read/pages/clubs.read.test.js

import {
  doc,
  onSnapshot,
} from 'firebase/firestore'

import {
  clearPlayersDatabaseDocumentCache,
  getDocumentCacheEntry,
  setDocumentCacheValue,
  buildClubsCenterCacheKey,
  buildClubDocumentCacheKey,
  invalidateDocumentCacheValueKeepingSnapshot,
} from '../../cache/index.js'
import {
  CLUBS_DIRECTORY_STORE_KEY,
  subscribeClubsDirectoryDocument,
  getCachedClubsPageData,
  getCachedClubPageData,
} from './clubs.read.js'
import { PLAYERS_DATABASE_SEASONS_CATALOG } from '../../../catalog/seasons.catalog.js'

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

test('reuses complete snapshots during invalidation without treating them as fresh reads', () => {
  expect(getCachedClubsPageData()).toBeNull()
  setDocumentCacheValue({ key: CLUBS_DIRECTORY_STORE_KEY, value: { clubsById: {} } })
  expect(getCachedClubsPageData()).toBeNull()
  PLAYERS_DATABASE_SEASONS_CATALOG.filter(season => (
    season.target === 'current' || season.target === 'history'
  )).forEach(season => {
    setDocumentCacheValue({
      key: buildClubsCenterCacheKey(season.seasonId),
      value: { documentExists: false },
    })
  })
  expect(getCachedClubsPageData()).not.toBeNull()
  expect(getCachedClubPageData('club-1')).toBeNull()
  setDocumentCacheValue({
    key: buildClubDocumentCacheKey('club-1'),
    value: { documentExists: true, names: { display: 'Club' } },
  })
  invalidateDocumentCacheValueKeepingSnapshot(CLUBS_DIRECTORY_STORE_KEY)
  expect(getDocumentCacheEntry(CLUBS_DIRECTORY_STORE_KEY).hit).toBe(false)
  expect(getCachedClubPageData('club-1')).toMatchObject({
    clubId: 'club-1', profile: { names: { display: 'Club' } },
  })
  expect(getCachedClubPageData('club-2')).toBeNull()
})
