// features/home/sharedLogic/tasks.resolver.js

import { normalizeTask } from '../../../shared/tasks/tasks.model.js'

export function resolveTasksFromShorts(tasksShorts = []) {
  const tasks = []

  for (const doc of tasksShorts) {
    const list = Array.isArray(doc?.list) ? doc.list : []

    for (const rawTask of list) {
      if (!rawTask?.id) continue
      tasks.push(normalizeTask(rawTask))
    }
  }

  const tasksById = new Map(tasks.map((task) => [task.id, task]))

  return {
    tasks,
    tasksById,
  }
}
