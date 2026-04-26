// features/home/sharedLogic/home.tasksSummary.js

import { TASK_STATUS } from '../../../shared/tasks/tasks.constants.js'

export function isInProgressTask(task) {
  const status = String(task?.status || '')
  return status === TASK_STATUS.IN_PROGRESS || status === 'inProgress'
}

export function getInProgressTasks(tasks = []) {
  return tasks.filter(isInProgressTask)
}

export function getOpenTasksCount(tasks = []) {
  return tasks.filter((task) => {
    const status = String(task?.status || '')
    return status !== TASK_STATUS.DONE && status !== 'done' && status !== 'archived'
  }).length
}
