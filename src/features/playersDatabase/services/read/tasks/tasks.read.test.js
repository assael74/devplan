// src/features/playersDatabase/services/read/tasks/tasks.read.test.js

import { subscribeShorts } from '../../../../../services/firestore/shorts/shorts.subscribe.js'
import {
  resetPlayersDatabaseTasksSubscription,
  subscribePlayersDatabaseTasks,
} from './tasks.read.js'

jest.mock('../../../../../services/firestore/shortsCollections.js', () => ({ tasksShortsRef: {} }))
jest.mock('../../../../../services/firestore/shorts/shorts.subscribe.js', () => ({ subscribeShorts: jest.fn() }))
jest.mock('../../../../../shared/tasks/tasks.model.js', () => ({
  isTaskOpen: jest.fn(() => true),
  normalizeTask: jest.fn(task => task),
}))

beforeEach(() => {
  jest.clearAllMocks()
  resetPlayersDatabaseTasksSubscription()
})

test('opens a new source subscription for a later subscriber after terminal listener error', () => {
  let firstSourceError
  const firstUnsubscribe = jest.fn()
  const secondUnsubscribe = jest.fn()

  subscribeShorts
    .mockImplementationOnce((ref, dataCallback, errorCallback) => {
      firstSourceError = errorCallback
      return firstUnsubscribe
    })
    .mockImplementationOnce(() => secondUnsubscribe)

  const firstOnTasks = jest.fn()
  const firstOnError = jest.fn()
  const firstUnsubscribeConsumer = subscribePlayersDatabaseTasks(firstOnTasks, firstOnError)

  const failure = new Error('terminal')
  firstSourceError(failure)

  expect(firstOnError).toHaveBeenLastCalledWith(failure)
  expect(subscribeShorts).toHaveBeenCalledTimes(1)

  const secondOnTasks = jest.fn()
  const secondOnError = jest.fn()
  const secondUnsubscribeConsumer = subscribePlayersDatabaseTasks(secondOnTasks, secondOnError)

  expect(subscribeShorts).toHaveBeenCalledTimes(2)
  expect(secondOnError).toHaveBeenCalledWith(failure)

  firstUnsubscribeConsumer()
  secondUnsubscribeConsumer()
})
