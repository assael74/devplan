// features/home/sharedLogic/home.workspace.js

import { TASK_STATUS } from '../../../shared/tasks/tasks.constants.js'

function isInProgressTask(task) {
  const status = String(task?.status || '')
  return status === TASK_STATUS.IN_PROGRESS || status === 'inProgress'
}

export function buildWorkspaceBuckets(tasks = []) {
  return {
    analyst: tasks.filter((task) => task?.workspace === 'analyst'),
    app: tasks.filter((task) => task?.workspace === 'app'),
    other: tasks.filter(
      (task) => !task?.workspace || !['analyst', 'app'].includes(task.workspace)
    ),
  }
}

export function buildInProgressBucket(tasks = []) {
  const all = tasks.filter(isInProgressTask)

  return {
    all,
    analyst: all.filter((task) => task?.workspace === 'analyst'),
    app: all.filter((task) => task?.workspace === 'app'),
  }
}
