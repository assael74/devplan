// src/features/firestoreUsage/sharedLogic/firestoreUsageViewModel.test.js

import { buildFirestoreUsageViewModel } from './firestoreUsageViewModel.js'
import {
  getFirestoreUsageSession,
  pushFirestoreUsageEntry,
  resetFirestoreUsageSession,
} from '../../../services/firestore/usage/firestoreUsage.session.js'

const read = overrides => pushFirestoreUsageEntry({
  operation: 'read', feature: 'playersDatabase', action: 'league-read', collection: 'dbLeagues',
  docsCount: 1, readsCount: 1, estimatedKb: 500.85, ...overrides,
})
const model = options => buildFirestoreUsageViewModel(getFirestoreUsageSession(), options)

beforeEach(() => resetFirestoreUsageSession())

test('cache-only activity is visible but does not raise server payload alerts', () => {
  read({ fromCache: true })
  const result = model()
  expect(result.hasActivity).toBe(true)
  expect(result.payloadSummary).toMatchObject({
    estimatedReadKb: 0, totalEstimatedKb: 0, estimatedCacheReadKb: 500.85, cacheReads: 1,
  })
  expect(result.recentEntries[0]).toMatchObject({ reads: 0, totalEstimatedKb: 0, fromCache: true })
  expect(result.alerts.map(alert => alert.color)).toEqual(['success'])
})

test('medium actions stay warning in both the table model and alerts despite a large session total', () => {
  for (let i = 0; i < 5; i += 1) read()
  const result = model()
  expect(result.expensiveActions.every(action => action.risk === 'warning')).toBe(true)
  expect(result.alerts.find(alert => alert.id === 'expensive-actions').color).toBe('warning')
  expect(result.alerts.find(alert => alert.id === 'top-collection').color).toBe('primary')
  expect(result.alerts.some(alert => alert.color === 'danger')).toBe(false)
})

test('a large single action raises the same danger severity in the table and alert', () => {
  read({ estimatedKb: 1000 })
  const result = model()
  expect(result.expensiveActions[0].risk).toBe('danger')
  expect(result.alerts.find(alert => alert.id === 'expensive-actions').color).toBe('danger')
})

test('listener reads are not counted a second time as updates and explicit zero remains zero in details', () => {
  read({ operation: 'listener-update', listenerPhase: 'initial' })
  read({ operation: 'listener-update', listenerPhase: 'update' })
  read({ readsCount: 0, docsCount: 8, estimatedKb: 0 })
  const result = model()
  expect(result.summary.totalOperations).toBe(2)
  expect(result.recentEntries[0].reads).toBe(0)
  expect(result.recentEntries[2].displayOperation).toBe('listener-initial')
})

test('write payloads remain writes in details instead of appearing as read payload', () => {
  pushFirestoreUsageEntry({ operation: 'write', writesCount: 1, estimatedKb: 300 })
  const result = model()
  expect(result.recentEntries[0]).toMatchObject({ estimatedReadKb: 0, estimatedWriteKb: 300, totalEstimatedKb: 300 })
  expect(result.expensiveActions[0]).toMatchObject({ estimatedReadKb: 0, estimatedWriteKb: 300 })
})

test('feature filtering retains separate cache and server measurements', () => {
  read({ fromCache: true })
  read({ feature: 'reports', estimatedKb: 2000 })
  const result = model({ feature: 'playersDatabase' })
  expect(result.totals).toMatchObject({ reads: 0, cacheReads: 1, estimatedReadKb: 0, estimatedCacheReadKb: 500.85 })
  expect(result.expensiveActions).toEqual([])
})

test('document rows preserve individual size and respect feature filtering', () => {
  const documents = [{ path: 'dbLeaguesCenter/all', estimatedKb: 500 }]
  read({ documents })
  read({ documents })
  read({ feature: 'reports', documents: [{ path: 'reports/all', estimatedKb: 900 }] })
  const rows = model({ feature: 'playersDatabase' }).documents
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({ path: 'dbLeaguesCenter/all', lastReadKb: 500, reads: 2, estimatedReadKb: 1000 })
})
