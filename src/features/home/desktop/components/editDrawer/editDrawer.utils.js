// src/features/home/components/editDrawer/editDrawer.utils.js

export const safe = (v) => (v == null ? '' : String(v))

export const buildInitialDraft = (task = {}) => {
  const raw = task?.task || task || {}

  return {
    id: raw?.id || task?.id || '',
    raw,

    workspace: safe(raw?.workspace),
    title: safe(raw?.title),
    description: safe(raw?.description),
    status: safe(raw?.status),
    priority: safe(raw?.priority),
    complexity: safe(raw?.complexity),
    taskType: safe(raw?.taskType),
    parentTaskId: safe(raw?.parentTaskId),
    sortOrder: raw?.sortOrder ?? '',
    dueDate: safe(raw?.dueDate),
    doneAt: safe(raw?.doneAt),
    url: safe(raw?.url),
  }
}

export const buildPatch = (draft = {}, initial = {}) => {
  const next = {}

  if (draft.workspace !== initial.workspace) next.workspace = draft.workspace || ''
  if (draft.title !== initial.title) next.title = draft.title || ''
  if (draft.description !== initial.description) next.description = draft.description || ''
  if (draft.status !== initial.status) next.status = draft.status || ''
  if (draft.priority !== initial.priority) next.priority = draft.priority || ''
  if (draft.complexity !== initial.complexity) next.complexity = draft.complexity || ''
  if (draft.taskType !== initial.taskType) next.taskType = draft.taskType || ''
  if (draft.parentTaskId !== initial.parentTaskId) next.parentTaskId = draft.parentTaskId || ''
  if (draft.sortOrder !== initial.sortOrder) next.sortOrder = draft.sortOrder || ''
  if (draft.dueDate !== initial.dueDate) next.dueDate = draft.dueDate || ''
  if (draft.doneAt !== initial.doneAt) next.doneAt = draft.doneAt || ''
  if (draft.url !== initial.url) next.url = draft.url || ''

  return next
}

export const getIsDirty = (draft = {}, initial = {}) =>
  draft.workspace !== initial.workspace ||
  draft.title !== initial.title ||
  draft.description !== initial.description ||
  draft.status !== initial.status ||
  draft.priority !== initial.priority ||
  draft.complexity !== initial.complexity ||
  draft.taskType !== initial.taskType ||
  draft.parentTaskId !== initial.parentTaskId ||
  draft.sortOrder !== initial.sortOrder ||
  draft.dueDate !== initial.dueDate ||
  draft.doneAt !== initial.doneAt ||
  draft.url !== initial.url
