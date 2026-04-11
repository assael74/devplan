// src\shared\tasks\tasks.builders.js

import {
  TASK_WORKSPACES,
  TASK_STATUS,
} from './tasks.constants.js'

import {
  normalizeTask,
  isParentTask,
  isSubTask,
  isTaskDone,
  isTaskArchived,
} from './tasks.model.js'

export function buildTasksList(rawList = []) {
  if (!Array.isArray(rawList)) return []
  return rawList.map((item) => normalizeTask(item))
}

export function buildTasksByWorkspace(tasks = []) {
  const normalized = buildTasksList(tasks)

  return {
    [TASK_WORKSPACES.ANALYST]: normalized.filter(
      (task) => task.workspace === TASK_WORKSPACES.ANALYST
    ),
    [TASK_WORKSPACES.APP]: normalized.filter(
      (task) => task.workspace === TASK_WORKSPACES.APP
    ),
  }
}

export function buildParentTasks(tasks = []) {
  return buildTasksList(tasks).filter((task) => isParentTask(task))
}

export function buildSubTasks(tasks = []) {
  return buildTasksList(tasks).filter((task) => isSubTask(task))
}

export function buildSubTasksMap(tasks = []) {
  const subTasks = buildSubTasks(tasks)

  return subTasks.reduce((acc, task) => {
    const parentId = task.parentTaskId
    if (!parentId) return acc

    if (!acc[parentId]) acc[parentId] = []
    acc[parentId].push(task)

    return acc
  }, {})
}

export function buildTaskProgress(parentTask, subTasks = []) {
  const relevantSubTasks = Array.isArray(subTasks) ? subTasks : []

  const total = relevantSubTasks.length
  const done = relevantSubTasks.filter((task) => isTaskDone(task)).length
  const open = total - done
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return {
    total,
    done,
    open,
    pct,
    hasSubTasks: total > 0,
    isCompleted: total > 0 && done === total,
  }
}

export function buildParentTasksWithProgress(tasks = []) {
  const normalized = buildTasksList(tasks)
  const parentTasks = buildParentTasks(normalized)
  const subTasksMap = buildSubTasksMap(normalized)

  return parentTasks.map((parentTask) => {
    const subTasks = subTasksMap[parentTask.id] || []
    const progress = buildTaskProgress(parentTask, subTasks)

    return {
      ...parentTask,
      subTasks,
      progress,
    }
  })
}

export function buildWorkspaceTasksView(tasks = [], workspace) {
  const normalized = buildTasksList(tasks)
  const workspaceTasks = normalized.filter((task) => task.workspace === workspace)

  const parentTasks = buildParentTasks(workspaceTasks)
  const subTasksMap = buildSubTasksMap(workspaceTasks)

  return buildSortedTasks(
    parentTasks.map((parentTask) => {
      const subTasks = buildSortedTasks(subTasksMap[parentTask.id] || [])
      const progress = buildTaskProgress(parentTask, subTasks)

      return {
        ...parentTask,
        subTasks,
        progress,
      }
    })
  )
}

export function buildTasksWorkspaceBuckets(tasks = []) {
  const normalized = buildTasksList(tasks)

  return {
    analyst: buildWorkspaceTasksView(normalized, TASK_WORKSPACES.ANALYST),
    app: buildWorkspaceTasksView(normalized, TASK_WORKSPACES.APP),
  }
}

export function buildTaskCounters(tasks = []) {
  const normalized = buildTasksList(tasks)

  const total = normalized.length
  const archived = normalized.filter((task) => isTaskArchived(task)).length
  const done = normalized.filter((task) => isTaskDone(task)).length
  const waiting = normalized.filter((task) => task.status === TASK_STATUS.WAITING).length
  const inProgress = normalized.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length
  const newTasks = normalized.filter((task) => task.status === TASK_STATUS.NEW).length
  const open = total - done - archived

  return {
    total,
    open,
    new: newTasks,
    inProgress,
    waiting,
    done,
    archived,
  }
}

export function buildWorkspaceCounters(tasks = []) {
  const buckets = buildTasksByWorkspace(tasks)

  return {
    analyst: buildTaskCounters(buckets[TASK_WORKSPACES.ANALYST] || []),
    app: buildTaskCounters(buckets[TASK_WORKSPACES.APP] || []),
  }
}

export function buildSortedTasks(tasks = []) {
  return [...buildTasksList(tasks)].sort(compareTasks)
}

export function compareTasks(a, b) {
  const priorityScoreA = getPriorityScore(a?.priority)
  const priorityScoreB = getPriorityScore(b?.priority)

  if (priorityScoreA !== priorityScoreB) {
    return priorityScoreB - priorityScoreA
  }

  const statusScoreA = getStatusScore(a?.status)
  const statusScoreB = getStatusScore(b?.status)

  if (statusScoreA !== statusScoreB) {
    return statusScoreB - statusScoreA
  }

  const dueDateA = getDueDateScore(a?.dueDate)
  const dueDateB = getDueDateScore(b?.dueDate)

  if (dueDateA !== dueDateB) {
    return dueDateA - dueDateB
  }

  const sortOrderA = Number.isFinite(Number(a?.sortOrder)) ? Number(a.sortOrder) : 0
  const sortOrderB = Number.isFinite(Number(b?.sortOrder)) ? Number(b.sortOrder) : 0

  if (sortOrderA !== sortOrderB) {
    return sortOrderA - sortOrderB
  }

  const updatedAtA = Number.isFinite(Number(a?.updatedAt)) ? Number(a.updatedAt) : 0
  const updatedAtB = Number.isFinite(Number(b?.updatedAt)) ? Number(b.updatedAt) : 0

  if (updatedAtA !== updatedAtB) {
    return updatedAtB - updatedAtA
  }

  return String(a?.title || '').localeCompare(String(b?.title || ''), 'he')
}

function getPriorityScore(priority) {
  if (priority === 'high') return 3
  if (priority === 'medium') return 2
  if (priority === 'low') return 1
  return 0
}

function getStatusScore(status) {
  if (status === TASK_STATUS.IN_PROGRESS) return 4
  if (status === TASK_STATUS.NEW) return 3
  if (status === TASK_STATUS.WAITING) return 2
  if (status === TASK_STATUS.DONE) return 1
  if (status === TASK_STATUS.ARCHIVED) return 0
  return 0
}

function getDueDateScore(dueDate) {
  const num = Number(dueDate)
  if (Number.isFinite(num)) return num
  return Number.MAX_SAFE_INTEGER
}
