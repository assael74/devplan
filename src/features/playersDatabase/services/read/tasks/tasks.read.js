// src/features/playersDatabase/services/read/tasks.read.js

import { tasksShortsRef } from '../../../../../services/firestore/shortsCollections.js'
import { subscribeShorts } from '../../../../../services/firestore/shorts/shorts.subscribe.js'
import {
  isTaskOpen,
  normalizeTask,
} from '../../../../../shared/tasks/tasks.model.js'

const TASKS_SUBSCRIPTION_GRACE_MS = 300
const subscribers = new Set()
let unsubscribeSource = null
let closeTimer = null
let lastTasks = null
let lastError = null

function resolvePlayersDatabaseTasks(shorts = []) {
  const tasks = []

  for (const doc of shorts) {
    const list = Array.isArray(doc?.list) ? doc.list : []

    for (const rawTask of list) {
      if (!rawTask?.id) continue

      const task = normalizeTask(rawTask)
      if (task.contextArea !== 'playersDatabase') continue
      if (!isTaskOpen(task)) continue

      tasks.push(task)
    }
  }

  return tasks.sort((a, b) => {
    const bTime = Number(b.updatedAt || b.createdAt || 0)
    const aTime = Number(a.updatedAt || a.createdAt || 0)
    return bTime - aTime
  })
}

const notifyTasks = tasks => {
  subscribers.forEach(subscriber => subscriber.onTasks(tasks))
}

const notifyError = error => {
  subscribers.forEach(subscriber => subscriber.onError?.(error))
}

const openSourceSubscription = () => {
  if (unsubscribeSource) return

  unsubscribeSource = subscribeShorts(
    tasksShortsRef,
    shorts => {
      const safeShorts = Array.isArray(shorts) ? shorts : []
      lastTasks = resolvePlayersDatabaseTasks(safeShorts)
      lastError = null
      notifyError(null)
      notifyTasks(lastTasks)
    },
    error => {
      unsubscribeSource = null
      lastError = error
      notifyError(error)
    },
    {
      feature: 'playersDatabase',
      action: 'subscribeTasks',
    }
  )
}

const scheduleSourceClose = () => {
  if (closeTimer) clearTimeout(closeTimer)

  closeTimer = setTimeout(() => {
    closeTimer = null
    if (subscribers.size || !unsubscribeSource) return

    unsubscribeSource()
    unsubscribeSource = null
  }, TASKS_SUBSCRIPTION_GRACE_MS)
}


export function resetPlayersDatabaseTasksSubscription() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }

  if (unsubscribeSource) {
    unsubscribeSource()
    unsubscribeSource = null
  }

  lastTasks = null
  lastError = null
  subscribers.clear()
}

export function subscribePlayersDatabaseTasks(onTasks, onError) {
  const subscriber = {
    onTasks,
    onError,
  }

  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }

  subscribers.add(subscriber)

  if (Array.isArray(lastTasks)) {
    onTasks(lastTasks)
  }
  if (lastError) {
    onError?.(lastError)
  }

  openSourceSubscription()

  return () => {
    subscribers.delete(subscriber)
    if (!subscribers.size) {
      scheduleSourceClose()
    }
  }
}
