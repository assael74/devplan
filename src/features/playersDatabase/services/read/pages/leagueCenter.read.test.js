// src/features/playersDatabase/services/read/pages/leagueCenter.read.test.js

import {
  doc,
  onSnapshot,
} from 'firebase/firestore'

import {
  trackFirestoreListenerClose,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
} from '../../../../../services/firestore/usage/index.js'
import { setDocumentCacheValue } from '../../cache/index.js'
import {
  LEAGUES_CENTER_STORE_KEY,
  subscribeLeagueCenterData,
} from './leagueCenter.read.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ path: 'dbLeaguesCenter/all' })),
  onSnapshot: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackFirestoreListenerClose: jest.fn(),
  trackFirestoreListenerOpen: jest.fn(),
  trackFirestoreListenerUpdate: jest.fn(),
  trackedGetDoc: jest.fn(),
  trackedGetDocFromServer: jest.fn(),
}))
jest.mock('../../cache/index.js', () => ({
  readWithDocumentCache: jest.fn(),
  refreshWithDocumentCache: jest.fn(),
  setDocumentCacheValue: jest.fn(),
}))

test('League Center listener publishes the updated document to the shared store', () => {
  let publishSnapshot
  const unsubscribe = jest.fn()
  onSnapshot.mockImplementation((reference, onNext) => {
    publishSnapshot = onNext
    return unsubscribe
  })

  const stop = subscribeLeagueCenterData()
  publishSnapshot({
    id: 'all',
    exists: () => true,
    data: () => ({
      leaguesById: {
        'league-1': {
          seasonsById: {
            '2026_2027': { tableState: 'NOT_LOADED' },
          },
        },
      },
    }),
    metadata: { fromCache: false },
  })

  expect(doc).toHaveBeenCalled()
  expect(trackFirestoreListenerOpen).toHaveBeenCalled()
  expect(trackFirestoreListenerUpdate).toHaveBeenCalled()
  expect(setDocumentCacheValue).toHaveBeenCalledWith({
    key: LEAGUES_CENTER_STORE_KEY,
    value: expect.objectContaining({
      id: 'all',
      documentExists: true,
    }),
  })

  stop()
  expect(unsubscribe).toHaveBeenCalled()
  expect(trackFirestoreListenerClose).toHaveBeenCalled()
})
