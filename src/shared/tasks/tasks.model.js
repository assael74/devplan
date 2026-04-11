// src/shared/tasks/tasks.model.js

import {
  TASK_WORKSPACES,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_COMPLEXITY,
  ANALYST_TASK_TYPES,
  APP_TASK_TYPES,
  getTaskTypeOptionsByWorkspace,
} from './tasks.constants.js'

export function buildTaskInitial(now = Date.now()) {
  return {
    id: '',
    workspace: TASK_WORKSPACES.ANALYST,

    title: '',
    url: '',
    description: '',

    status: TASK_STATUS.NEW,
    priority: TASK_PRIORITY.MEDIUM,
    complexity: TASK_COMPLEXITY.MEDIUM,
    taskType: ANALYST_TASK_TYPES.GENERAL,

    parentTaskId: null,
    sortOrder: 0,

    dueDate: null,

    contextArea: '',
    contextMode: '',

    createdAt: now,
    updatedAt: now,
    doneAt: null,
  }
}

export function normalizeTask(task = {}, now = Date.now()) {
  const base = buildTaskInitial(now)

  const workspace = normalizeWorkspace(task?.workspace)
  const validTaskType = normalizeTaskType(workspace, task?.taskType)

  const normalized = {
    ...base,
    ...task,

    id: task?.id || '',
    workspace,

    title: typeof task?.title === 'string' ? task.title : '',
    url: typeof task?.url === 'string' ? task.url : '',
    description: typeof task?.description === 'string' ? task.description : '',

    status: normalizeStatus(task?.status),
    priority: normalizePriority(task?.priority),
    complexity: normalizeComplexity(task?.complexity),
    taskType: validTaskType,

    parentTaskId: normalizeParentTaskId(task?.parentTaskId),
    sortOrder: Number.isFinite(Number(task?.sortOrder)) ? Number(task.sortOrder) : 0,

    dueDate: normalizeDateValue(task?.dueDate),

    contextArea: typeof task?.contextArea === 'string' ? task.contextArea : '',
    contextMode: typeof task?.contextMode === 'string' ? task.contextMode : '',

    createdAt: Number.isFinite(Number(task?.createdAt)) ? Number(task.createdAt) : now,
    updatedAt: Number.isFinite(Number(task?.updatedAt)) ? Number(task.updatedAt) : now,
    doneAt: normalizeDoneAt(task?.doneAt, task?.status),
  }

  if (normalized.status !== TASK_STATUS.DONE) {
    normalized.doneAt = null
  }

  return normalized
}

export function isParentTask(task) {
  return !task?.parentTaskId
}

export function isSubTask(task) {
  return Boolean(task?.parentTaskId)
}

export function isTaskDone(task) {
  return task?.status === TASK_STATUS.DONE
}

export function isTaskArchived(task) {
  return task?.status === TASK_STATUS.ARCHIVED
}

export function isTaskOpen(task) {
  return !isTaskDone(task) && !isTaskArchived(task)
}

export function getDefaultTaskTypeByWorkspace(workspace) {
  if (workspace === TASK_WORKSPACES.APP) {
    return APP_TASK_TYPES.GENERAL
  }

  return ANALYST_TASK_TYPES.GENERAL
}

function normalizeWorkspace(workspace) {
  const validValues = Object.values(TASK_WORKSPACES)
  return validValues.includes(workspace) ? workspace : TASK_WORKSPACES.ANALYST
}

function normalizeStatus(status) {
  const validValues = Object.values(TASK_STATUS)
  return validValues.includes(status) ? status : TASK_STATUS.NEW
}

function normalizePriority(priority) {
  const validValues = Object.values(TASK_PRIORITY)
  return validValues.includes(priority) ? priority : TASK_PRIORITY.MEDIUM
}

function normalizeComplexity(complexity) {
  const validValues = Object.values(TASK_COMPLEXITY)
  return validValues.includes(complexity) ? complexity : TASK_COMPLEXITY.MEDIUM
}

function normalizeTaskType(workspace, taskType) {
  const options = getTaskTypeOptionsByWorkspace(workspace)
  const validIds = options.map((item) => item.id)

  if (validIds.includes(taskType)) return taskType

  return getDefaultTaskTypeByWorkspace(workspace)
}

function normalizeParentTaskId(parentTaskId) {
  if (!parentTaskId) return null
  return typeof parentTaskId === 'string' ? parentTaskId : null
}

function normalizeDateValue(value) {
  if (value == null || value === '') return null

  if (typeof value === 'string') return value

  const num = Number(value)
  if (Number.isFinite(num)) return num

  return null
}

function normalizeDoneAt(doneAt, status) {
  if (status !== TASK_STATUS.DONE) return null

  const num = Number(doneAt)
  if (Number.isFinite(num)) return num

  return null
}
