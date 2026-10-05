// src/features/playersDatabase/services/read/pages/leaguePage.read.test.js

import { onSnapshot } from 'firebase/firestore'

import {
  buildLeagueDocumentCacheKey,
  clearPlayersDatabaseDocumentCache,
  getDocumentStoreSnapshot,
} from '../../cache/index.js'
import { subscribeLeaguePageData } from './leaguePage.read.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((_db, collectionName, documentId) => ({
    path: `${collectionName}/${documentId}`,
  })),
  onSnapshot: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackFirestoreListenerClose: jest.fn(),
  trackFirestoreListenerOpen: jest.fn(),
  trackFirestoreListenerUpdate: jest.fn(),
}))
jest.mock('../entities/league.js', () => ({ getLeagueById: jest.fn() }))

beforeEach(() => {
  jest.clearAllMocks()
  clearPlayersDatabaseDocumentCache()
})

test('publishes League document updates to the page Store and unsubscribes', () => {
  let publish
  const unsubscribe = jest.fn()
  onSnapshot.mockImplementation((_reference, onValue) => {
    publish = onValue
    return unsubscribe
  })

  const stop = subscribeLeaguePageData({ leagueId: 'league-1' })
  publish({
    id: 'league-1',
    exists: () => true,
    data: () => ({ seasonsById: { '2026_2027': { table: { teamsById: {} } } } }),
    metadata: { fromCache: false },
  })

  expect(getDocumentStoreSnapshot(buildLeagueDocumentCacheKey('league-1'))).toMatchObject({
    status: 'ready',
    data: expect.objectContaining({ id: 'league-1' }),
  })
  stop()
  expect(unsubscribe).toHaveBeenCalledTimes(1)
})
