// src/services/firestore/usage/firestoreUsage.instrumentation.test.js

import { getDoc, getDocs, getDocFromServer, setDoc } from 'firebase/firestore'
import { trackedGetDoc, trackedGetDocFromServer, trackedGetDocs, trackedSetDoc } from './firestoreUsage.instrumentation.js'
import { getFirestoreUsageSession, resetFirestoreUsageSession } from './firestoreUsage.session.js'

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  getDocFromServer: jest.fn(),
  setDoc: jest.fn(),
}))

const ref = { id: 'league-1', path: 'dbLeagues/league-1' }
const documentSnapshot = fromCache => ({
  exists: () => true,
  data: () => ({ leagueName: 'Test' }),
  metadata: { fromCache },
})

beforeEach(() => {
  jest.clearAllMocks()
  resetFirestoreUsageSession()
})

test.each([true, false])('getDoc forwards source metadata and document identity: fromCache=%s', async fromCache => {
  getDoc.mockResolvedValue(documentSnapshot(fromCache))
  await trackedGetDoc(ref)

  const { totals, recentEntries } = getFirestoreUsageSession()
  expect(totals.reads).toBe(fromCache ? 0 : 1)
  expect(totals.cacheReads).toBe(fromCache ? 1 : 0)
  expect(recentEntries[0]).toMatchObject({ shortKey: 'league-1', fromCache })
  expect(getFirestoreUsageSession().byDocument[ref.path]).toMatchObject({
    reads: fromCache ? 0 : 1,
    cacheReads: fromCache ? 1 : 0,
  })
  expect(fromCache ? totals.estimatedCacheReadKb : totals.estimatedReadKb).toBeGreaterThan(0)
})

test('a cached query records documents as cache events without the minimum server read', async () => {
  getDocs.mockResolvedValue({ docs: [{ data: () => ({ name: 'cached' }) }], size: 1, metadata: { fromCache: true } })
  await trackedGetDocs({ path: 'dbLeagues' })
  expect(getFirestoreUsageSession().totals).toMatchObject({ reads: 0, cacheReads: 1, estimatedReadKb: 0 })
})

test('a missing server document remains one read with zero returned documents', async () => {
  getDocFromServer.mockResolvedValue({ exists: () => false })
  await trackedGetDocFromServer(ref)
  expect(getFirestoreUsageSession().totals.reads).toBe(1)
  expect(getFirestoreUsageSession().recentEntries[0]).toMatchObject({ docsCount: 0, readsCount: 1, shortKey: 'league-1' })
})

test('failed writes record failures without successful writes', async () => {
  setDoc.mockRejectedValue(new Error('write failed'))
  await expect(trackedSetDoc(ref, { value: 1 })).rejects.toThrow('write failed')
  expect(getFirestoreUsageSession().totals).toMatchObject({ writes: 0, failures: 1 })
})

test('query results retain each document size instead of splitting the query total equally', async () => {
  getDocs.mockResolvedValue({
    docs: [
      { ref: { path: 'dbLeagues/a' }, data: () => ({ name: 'a' }) },
      { ref: { path: 'dbLeagues/b' }, data: () => ({ name: 'b'.repeat(1000) }) },
    ],
    size: 2,
    metadata: { fromCache: false },
  })
  await trackedGetDocs({ path: 'dbLeagues' })
  const rows = getFirestoreUsageSession().byDocument
  expect(rows['dbLeagues/b'].lastReadKb).toBeGreaterThan(rows['dbLeagues/a'].lastReadKb)
  expect(rows['dbLeagues/a'].reads).toBe(1)
  expect(rows['dbLeagues/b'].reads).toBe(1)
})
