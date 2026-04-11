// ui/forms/helpers/tasksForm.helpers.js

import {
  normalizeTask,
  getDefaultTaskTypeByWorkspace,
} from '../../../shared/tasks/tasks.model.js'

import {
  TASK_WORKSPACES,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_COMPLEXITY,
} from '../../../shared/tasks/tasks.constants.js'

const clean = (value) => String(value ?? '').trim()

export function buildTaskPresetDraft(taskContext = {}) {
  const workspace = taskContext?.workspace || TASK_WORKSPACES.ANALYST

  return normalizeTask({
    id: '',
    workspace,
    title: '',
    url: clean(taskContext?.url),
    description: '',
    status: TASK_STATUS.NEW,
    priority: TASK_PRIORITY.MEDIUM,
    complexity: TASK_COMPLEXITY.MEDIUM,
    taskType: getDefaultTaskTypeByWorkspace(workspace),
    parentTaskId: null,
    sortOrder: 0,
    dueDate: null,
    createdAt: null,
    updatedAt: null,
    doneAt: null,
    contextArea: clean(taskContext?.contextArea),
    contextMode: clean(taskContext?.contextMode),
  })
}

export function buildTaskCreateItem({ id, draft, now = Date.now() }) {
  const workspace = draft?.workspace || TASK_WORKSPACES.ANALYST

  return normalizeTask(
    {
      id,
      workspace,
      title: clean(draft?.title),
      url: clean(draft?.url),
      description: clean(draft?.description),
      status: draft?.status || TASK_STATUS.NEW,
      priority: draft?.priority || TASK_PRIORITY.MEDIUM,
      complexity: draft?.complexity || TASK_COMPLEXITY.MEDIUM,
      taskType: draft?.taskType || getDefaultTaskTypeByWorkspace(workspace),
      parentTaskId: draft?.parentTaskId || null,
      sortOrder: Number(draft?.sortOrder || 0),
      dueDate: draft?.dueDate || null,
      createdAt: now,
      updatedAt: now,
      doneAt: draft?.status === TASK_STATUS.DONE ? now : null,
      contextArea: clean(draft?.contextArea),
      contextMode: clean(draft?.contextMode),
    },
    now
  )
}
