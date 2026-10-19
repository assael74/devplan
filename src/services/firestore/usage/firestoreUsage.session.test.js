// src/services/firestore/usage/firestoreUsage.session.test.js

import {
  getFirestoreUsageSession,
  pushFirestoreUsageEntry,
  resetFirestoreUsageSession,
} from './firestoreUsage.session.js'
import {
  resetFirestoreUsageSnapshot,
  trackFirestoreListenerOpen,
} from './firestoreUsage.tracker.js'

const context = {
  collection: 'dbLeaguesCenter',
  feature: 'playersDatabase',
  action: 'league-center-live',
  listenerId: 'league-center',
}

beforeEach(() => {
  Object.keys(getFirestoreUsageSession().activeListenerIds).forEach(listenerId => {
    pushFirestoreUsageEntry({ operation: 'listener-close', listenerId })
  })
  resetFirestoreUsageSession()
})

test('cache snapshots stay outside server reads, payload and expensive actions in every bucket', () => {
  pushFirestoreUsageEntry({ ...context, operation: 'listener-open' })
  const event = pushFirestoreUsageEntry({
    ...context,
    operation: 'listener-update',
    docsCount: 1,
    readsCount: 1,
    estimatedKb: 500.85,
    fromCache: true,
  })

  const snapshot = getFirestoreUsageSession()
  const expected = {
    reads: 0,
    cacheReads: 1,
    estimatedReadKb: 0,
    estimatedCacheReadKb: 500.85,
    listenerUpdates: 0,
    listenerInitials: 0,
  }
  expect(event).toMatchObject({ readsCount: 0, estimatedKb: 0, estimatedCacheReadKb: 500.85 })
  expect(snapshot.totals).toMatchObject(expected)
  expect(snapshot.byCollection.dbLeaguesCenter).toMatchObject(expected)
  expect(snapshot.byFeatureDetails.playersDatabase.totals).toMatchObject(expected)
  expect(snapshot.byProcess['playersDatabase::league-center-live::dbLeaguesCenter']).toMatchObject(expected)
  expect(snapshot.expensiveActions).toEqual([])
})

test('the first server snapshot is initial even after a cache snapshot or error', () => {
  pushFirestoreUsageEntry({ ...context, operation: 'listener-open' })
  pushFirestoreUsageEntry({ ...context, operation: 'listener-update', fromCache: true, docsCount: 1 })
  pushFirestoreUsageEntry({ ...context, operation: 'listener-update', status: 'error' })
  const first = pushFirestoreUsageEntry({
    ...context, operation: 'listener-update', listenerPhase: 'update', docsCount: 1, estimatedKb: 500.85,
  })
  const second = pushFirestoreUsageEntry({
    ...context, operation: 'listener-update', docsCount: 1, estimatedKb: 500.85,
  })

  expect(first.listenerPhase).toBe('initial')
  expect(second.listenerPhase).toBe('update')
  expect(getFirestoreUsageSession().totals).toMatchObject({
    reads: 2, cacheReads: 1, listenerInitials: 1, listenerUpdates: 1, failures: 1,
    estimatedReadKb: 1001.7,
  })
})

test('explicit zero counts survive instead of falling back to document count or one', () => {
  pushFirestoreUsageEntry({ operation: 'listener-update', docsCount: 8, readsCount: 0 })
  pushFirestoreUsageEntry({ operation: 'write', writesCount: 0, status: 'error' })
  pushFirestoreUsageEntry({ operation: 'document-delete', documentDeletesCount: 0, status: 'error' })
  pushFirestoreUsageEntry({ operation: 'logical-delete', logicalDeletesCount: 0 })

  expect(getFirestoreUsageSession().totals).toMatchObject({
    reads: 0, writes: 0, documentDeletes: 0, logicalDeletes: 0, failures: 2,
  })
})

test('cache entries forwarded between tabs retain their cache payload and are deduplicated', () => {
  const event = pushFirestoreUsageEntry({
    ...context, operation: 'read', docsCount: 1, readsCount: 1, estimatedKb: 608.76, fromCache: true,
  })
  resetFirestoreUsageSession()
  pushFirestoreUsageEntry(event, { skipBroadcast: true })
  pushFirestoreUsageEntry(event, { skipBroadcast: true })

  expect(getFirestoreUsageSession().totals).toMatchObject({
    calls: 1, reads: 0, cacheReads: 1, estimatedReadKb: 0, estimatedCacheReadKb: 608.76,
  })
})

test('reset retains active listener lifecycle and entries record their source page', () => {
  pushFirestoreUsageEntry({ ...context, operation: 'listener-open' })
  pushFirestoreUsageEntry({ ...context, operation: 'listener-update', docsCount: 1 })
  resetFirestoreUsageSession()
  const event = pushFirestoreUsageEntry({ ...context, operation: 'listener-update', docsCount: 1 })

  expect(event.listenerPhase).toBe('update')
  expect(event.route).toBe(`${window.location.pathname}${window.location.search}`)
  expect(getFirestoreUsageSession().totals).toMatchObject({
    activeListeners: 1, reads: 1, listenerInitials: 0, listenerUpdates: 1,
  })
})

test('unknown and repeated closes cannot reduce the count of another active listener', () => {
  pushFirestoreUsageEntry({ ...context, operation: 'listener-open' })
  pushFirestoreUsageEntry({ ...context, operation: 'listener-open', listenerId: 'other' })
  pushFirestoreUsageEntry({ ...context, operation: 'listener-close', listenerId: 'old-runtime-listener' })
  pushFirestoreUsageEntry({ operation: 'listener-close', listenerId: context.listenerId })
  pushFirestoreUsageEntry({ ...context, operation: 'listener-close' })

  const snapshot = getFirestoreUsageSession()
  expect(Object.keys(snapshot.activeListenerIds)).toEqual(['other'])
  expect(snapshot.totals.activeListeners).toBe(1)
  expect(snapshot.byCollection.dbLeaguesCenter.activeListeners).toBe(1)
  expect(snapshot.byFeature.playersDatabase.activeListeners).toBe(1)
  expect(snapshot.byFeatureDetails.playersDatabase.totals.activeListeners).toBe(1)
  expect(snapshot.byProcess['playersDatabase::league-center-live::dbLeaguesCenter'].activeListeners).toBe(1)
})

test('a repeated open for an existing id does not duplicate active counts or reset its initial snapshot', () => {
  pushFirestoreUsageEntry({ ...context, operation: 'listener-open' })
  pushFirestoreUsageEntry({ ...context, operation: 'listener-update', docsCount: 1 })
  pushFirestoreUsageEntry({ ...context, operation: 'listener-open' })
  const update = pushFirestoreUsageEntry({ ...context, operation: 'listener-update', docsCount: 1 })

  expect(getFirestoreUsageSession().totals.activeListeners).toBe(1)
  expect(update.listenerPhase).toBe('update')
  resetFirestoreUsageSession()
  expect(getFirestoreUsageSession().totals.activeListeners).toBe(1)
})

test('reset never reuses generated ids while earlier listeners are still active', () => {
  const first = trackFirestoreListenerOpen({ collection: 'clubsShorts', feature: 'coreData' })
  resetFirestoreUsageSnapshot()
  const second = trackFirestoreListenerOpen({ collection: 'clubsShorts', feature: 'coreData' })

  expect(first.listenerId).not.toBe(second.listenerId)
  expect(getFirestoreUsageSession().totals.activeListeners).toBe(2)
  expect(Object.keys(getFirestoreUsageSession().activeListenerIds)).toHaveLength(2)
})

test('document sizes stay separate from cumulative payload, cache and other collections', () => {
  const sample = { path: 'dbLeaguesCenter/all', estimatedKb: 500 }
  const read = { operation: 'read', feature: 'playersDatabase', readsCount: 1, docsCount: 1, documents: [sample] }
  pushFirestoreUsageEntry(read)
  pushFirestoreUsageEntry(read)
  pushFirestoreUsageEntry({ ...read, fromCache: true, documents: [{ ...sample, estimatedKb: 600 }] })
  pushFirestoreUsageEntry({ ...read, documents: [{ path: 'dbClubsDirectory/all', estimatedKb: 100 }] })
  // History trimming must not lose earlier document measurements.
  for (let i = 0; i < 205; i += 1) pushFirestoreUsageEntry({ operation: 'read', readsCount: 0 })
  const snapshot = getFirestoreUsageSession()
  expect(snapshot.byDocument['dbLeaguesCenter/all']).toMatchObject({
    reads: 2, cacheReads: 1, lastReadKb: 600, maxReadKb: 600,
    estimatedReadKb: 1000, estimatedCacheReadKb: 600, lastFromCache: true,
  })
  expect(snapshot.byFeatureDetails.playersDatabase.byDocument['dbLeaguesCenter/all'].reads).toBe(2)
  expect(snapshot.byDocument['dbClubsDirectory/all'].lastReadKb).toBe(100)
  resetFirestoreUsageSession()
  expect(getFirestoreUsageSession().byDocument).toEqual({})
})

test('patches, transactions, failed reads and unidentified payloads do not imply a full document size', () => {
  const documents = [{ path: 'dbLeagues/all', estimatedKb: 400 }]
  pushFirestoreUsageEntry({ operation: 'write', documents })
  pushFirestoreUsageEntry({ operation: 'transaction', documents })
  pushFirestoreUsageEntry({ operation: 'read', status: 'error', documents })
  pushFirestoreUsageEntry({ operation: 'read', documents: [{ path: 'unknown', estimatedKb: 400 }] })
  expect(getFirestoreUsageSession().byDocument).toEqual({})
})
