// src/services/firestore/shorts/shorts.subscribe.test.js

import { subscribeTrackedQuery } from '../subscriptions/index.js'
import { subscribeShorts } from './shorts.subscribe.js'

jest.mock('../subscriptions/index.js', () => ({
  subscribeTrackedQuery: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

test('uses a stable collection subscription key and maps query snapshots to shorts data', () => {
  let sourceNext = null
  const unsubscribe = jest.fn()
  subscribeTrackedQuery.mockImplementation((ref, onNext) => {
    sourceNext = onNext
    return unsubscribe
  })

  const ref = { path: 'tasksShorts' }
  const onData = jest.fn()
  const returnedUnsubscribe = subscribeShorts(ref, onData, jest.fn(), {
    feature: 'playersDatabase',
    action: 'subscribeTasks',
  })

  expect(subscribeTrackedQuery).toHaveBeenCalledWith(
    ref,
    expect.any(Function),
    expect.any(Function),
    expect.objectContaining({
      subscriptionKey: 'shorts:tasksShorts',
      sourceCollection: 'tasksShorts',
      sourceShortKey: 'tasksShorts',
      sourceFeature: 'coreData',
      sourceAction: 'subscribeShorts',
      consumerFeature: 'playersDatabase',
      consumerAction: 'subscribeTasks',
    })
  )

  sourceNext({
    docs: [
      { id: 'a', data: () => ({ list: [1] }) },
      { id: 'b', data: () => ({ list: [2] }) },
    ],
  })

  expect(onData).toHaveBeenCalledWith([
    { docName: 'a', list: [1] },
    { docName: 'b', list: [2] },
  ])
  expect(returnedUnsubscribe).toBe(unsubscribe)
})
