// src/features/playersDatabase/services/read/tasks.read.js

import { tasksShortsRef } from '../../../../services/firestore/shortsCollections.js'
import { subscribeShorts } from '../../../../services/firestore/shorts/shorts.subscribe.js'
import {
  isTaskOpen,
  normalizeTask,
} from '../../../../shared/tasks/tasks.model.js'

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

export function subscribePlayersDatabaseTasks(onTasks, onError) {
  return subscribeShorts(
    tasksShortsRef,
    shorts => {
      const safeShorts = Array.isArray(shorts) ? shorts : []
      onTasks(resolvePlayersDatabaseTasks(safeShorts))
    },
    onError,
    {
      feature: 'playersDatabase',
      action: 'subscribeTasks',
    }
  )
}
