// src/services/firestore/subscriptions/firestoreSubscriptions.test.js

import { onSnapshot } from 'firebase/firestore'
import {
  getTrackedSubscriptionsSnapshot,
  resetTrackedSubscriptions,
  subscribeTrackedDocument,
  subscribeTrackedQuery,
} from './firestoreSubscriptions.js'
import {
  getCollectionNameFromRef,
  trackFirestoreListenerClose,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
} from '../usage/index.js'

jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
}))

jest.mock('../usage/index.js', () => ({
  getCollectionNameFromRef: jest.fn(ref => String(ref?.path || '').split('/')[0] || 'unknown'),
  trackFirestoreListenerOpen: jest.fn(() => ({ listenerId: 'listener-1' })),
  trackFirestoreListenerClose: jest.fn(),
  trackFirestoreListenerUpdate: jest.fn(),
}))

const querySnapshot = ({ ids = ['a'], fromCache = false, changes } = {}) => ({
  docs: ids.map(id => ({ id, data: () => ({ value: id }) })),
  docChanges: () => (changes || ids.map(id => ({
    type: 'added',
    doc: { id, data: () => ({ value: id }) },
  }))),
  metadata: { fromCache },
})

const documentSnapshot = ({ exists = true, fromCache = false } = {}) => ({
  exists: () => exists,
  data: () => (exists ? { value: 'doc' } : undefined),
  metadata: { fromCache },
})

beforeEach(() => {
  resetTrackedSubscriptions()
  jest.clearAllMocks()
  getCollectionNameFromRef.mockImplementation(
    ref => String(ref?.path || '').split('/')[0] || 'unknown'
  )
  trackFirestoreListenerOpen.mockReturnValue({ listenerId: 'listener-1' })
})

test('deduplicates query listener by explicit subscription key and closes after last subscriber', () => {
  const sourceUnsubscribe = jest.fn()
  let sourceNext = null
  onSnapshot.mockImplementation((ref, onNext) => {
    sourceNext = onNext
    return sourceUnsubscribe
  })

  const ref = { path: 'tasksShorts' }
  const first = jest.fn()
  const second = jest.fn()

  const unsubscribeFirst = subscribeTrackedQuery(ref, first, null, {
    subscriptionKey: 'tasks',
    feature: 'playersDatabase',
  })
  const unsubscribeSecond = subscribeTrackedQuery(ref, second, null, {
    subscriptionKey: 'tasks',
    feature: 'playersDatabase',
  })

  expect(onSnapshot).toHaveBeenCalledTimes(1)
  expect(trackFirestoreListenerOpen).toHaveBeenCalledTimes(1)
  expect(getTrackedSubscriptionsSnapshot()).toEqual([
    expect.objectContaining({
      key: 'query:tasks',
      subscribersCount: 2,
    }),
  ])

  const snapshot = querySnapshot({ ids: ['a', 'b'] })
  sourceNext(snapshot)

  expect(first).toHaveBeenCalledWith(snapshot)
  expect(second).toHaveBeenCalledWith(snapshot)
  expect(trackFirestoreListenerUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      listenerPhase: 'initial',
      docsCount: 2,
      readsCount: 2,
    })
  )

  unsubscribeFirst()
  expect(sourceUnsubscribe).not.toHaveBeenCalled()

  unsubscribeSecond()
  expect(sourceUnsubscribe).toHaveBeenCalledTimes(1)
  expect(trackFirestoreListenerClose).toHaveBeenCalledTimes(1)
  expect(getTrackedSubscriptionsSnapshot()).toEqual([])
})

test('replays latest query snapshot to a later subscriber without opening another listener', () => {
  let sourceNext = null
  onSnapshot.mockImplementation((ref, onNext) => {
    sourceNext = onNext
    return jest.fn()
  })

  const ref = { path: 'tasksShorts' }
  const first = jest.fn()
  const second = jest.fn()

  subscribeTrackedQuery(ref, first, null, { subscriptionKey: 'tasks' })
  const snapshot = querySnapshot({ ids: ['a'] })
  sourceNext(snapshot)

  subscribeTrackedQuery(ref, second, null, { subscriptionKey: 'tasks' })

  expect(onSnapshot).toHaveBeenCalledTimes(1)
  expect(second).toHaveBeenCalledTimes(1)
  expect(second).toHaveBeenCalledWith(snapshot)
})

test('requires explicit key for query listeners so filtered queries cannot collide by path', () => {
  expect(() => subscribeTrackedQuery({ path: 'dbSearchIndexes' }, jest.fn())).toThrow(
    'Tracked query subscription requires an explicit subscriptionKey'
  )
  expect(onSnapshot).not.toHaveBeenCalled()
})

test('deduplicates document listeners by document path', () => {
  const sourceUnsubscribe = jest.fn()
  let sourceNext = null
  onSnapshot.mockImplementation((ref, onNext) => {
    sourceNext = onNext
    return sourceUnsubscribe
  })

  const ref = { path: 'dbLeagues/931' }
  const first = jest.fn()
  const second = jest.fn()

  const unsubscribeFirst = subscribeTrackedDocument(ref, first)
  const unsubscribeSecond = subscribeTrackedDocument(ref, second)

  expect(onSnapshot).toHaveBeenCalledTimes(1)

  const snapshot = documentSnapshot()
  sourceNext(snapshot)

  expect(first).toHaveBeenCalledWith(snapshot)
  expect(second).toHaveBeenCalledWith(snapshot)
  expect(trackFirestoreListenerUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      listenerPhase: 'initial',
      docsCount: 1,
      readsCount: 1,
    })
  )

  unsubscribeFirst()
  unsubscribeSecond()
  expect(sourceUnsubscribe).toHaveBeenCalledTimes(1)
})


test('uses canonical physical metadata while tracking different logical consumers on the same listener', () => {
  let sourceNext = null
  onSnapshot.mockImplementation((ref, onNext) => {
    sourceNext = onNext
    return jest.fn()
  })

  const ref = { path: 'tasksShorts' }

  subscribeTrackedQuery(ref, jest.fn(), null, {
    subscriptionKey: 'tasks',
    sourceFeature: 'coreData',
    sourceAction: 'subscribeShorts',
    consumerFeature: 'playersDatabase',
    consumerAction: 'subscribeTasks',
  })
  subscribeTrackedQuery(ref, jest.fn(), null, {
    subscriptionKey: 'tasks',
    sourceFeature: 'coreData',
    sourceAction: 'subscribeShorts',
    consumerFeature: 'coreData',
    consumerAction: 'homeTasks',
  })

  expect(onSnapshot).toHaveBeenCalledTimes(1)
  expect(trackFirestoreListenerOpen).toHaveBeenCalledTimes(1)
  expect(trackFirestoreListenerOpen).toHaveBeenCalledWith(
    expect.objectContaining({
      feature: 'coreData',
      action: 'subscribeShorts',
      collection: 'tasksShorts',
    })
  )
  expect(getTrackedSubscriptionsSnapshot()).toEqual([
    expect.objectContaining({
      key: 'query:tasks',
      consumerFeatures: ['coreData', 'playersDatabase'],
      consumerActions: ['homeTasks', 'subscribeTasks'],
    }),
  ])

  sourceNext(querySnapshot({ ids: ['a'] }))

  expect(trackFirestoreListenerUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      feature: 'coreData',
      action: 'subscribeShorts',
      meta: expect.objectContaining({
        consumerFeatures: ['coreData', 'playersDatabase'],
        consumerActions: ['homeTasks', 'subscribeTasks'],
      }),
    })
  )
})

test('terminal listener error closes the shared entry and allows a future resubscribe', () => {
  const sourceUnsubscribeFirst = jest.fn()
  const sourceUnsubscribeSecond = jest.fn()
  let sourceError = null

  onSnapshot
    .mockImplementationOnce((ref, onNext, onError) => {
      sourceError = onError
      return sourceUnsubscribeFirst
    })
    .mockImplementationOnce(() => sourceUnsubscribeSecond)

  const ref = { path: 'tasksShorts' }
  const firstError = jest.fn()

  subscribeTrackedQuery(ref, jest.fn(), firstError, {
    subscriptionKey: 'tasks',
    sourceFeature: 'coreData',
    sourceAction: 'subscribeShorts',
    consumerFeature: 'playersDatabase',
  })

  const error = new Error('listener failed')
  sourceError(error)

  expect(firstError).toHaveBeenCalledWith(error)
  expect(sourceUnsubscribeFirst).toHaveBeenCalledTimes(1)
  expect(trackFirestoreListenerClose).toHaveBeenCalledTimes(1)
  expect(getTrackedSubscriptionsSnapshot()).toEqual([])

  subscribeTrackedQuery(ref, jest.fn(), jest.fn(), {
    subscriptionKey: 'tasks',
    sourceFeature: 'coreData',
    sourceAction: 'subscribeShorts',
    consumerFeature: 'coreData',
  })

  expect(onSnapshot).toHaveBeenCalledTimes(2)
  expect(trackFirestoreListenerOpen).toHaveBeenCalledTimes(2)
  expect(getTrackedSubscriptionsSnapshot()).toEqual([
    expect.objectContaining({
      key: 'query:tasks',
      subscribersCount: 1,
      hasError: false,
    }),
  ])
})
