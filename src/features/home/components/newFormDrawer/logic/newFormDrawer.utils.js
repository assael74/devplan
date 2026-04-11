// features/home/components/newFormDrawer/logic/newFormDrawer.utils.js

import { buildTaskPresetDraft } from '../../../../../ui/forms/helpers/tasksForm.helpers.js'

export function buildInitialDraft(taskContext = {}) {
  return buildTaskPresetDraft(taskContext)
}

export function getTaskCreateValidity(draft = {}) {
  return {
    title: String(draft?.title || '').trim().length > 0,
    workspace: String(draft?.workspace || '').trim().length > 0,
    taskType: String(draft?.taskType || '').trim().length > 0,
  }
}

export function getIsValid(validity = {}) {
  return Boolean(validity?.title && validity?.workspace && validity?.taskType)
}

export function getIsDirty(draft = {}, initial = {}) {
  return (
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
    draft.url !== initial.url ||
    draft.contextArea !== initial.contextArea ||
    draft.contextMode !== initial.contextMode
  )
}

export function getDrawerEntityByWorkspace(workspace) {
  return workspace === 'app' ? 'taskApp' : 'taskAnalyst'
}

export function buildTaskContextFromSectionId(id) {
  if (id === 'taskApp') {
    return {
      workspace: 'app',
      contextArea: 'home',
      contextMode: 'app',
    }
  }

  if (id === 'taskAnalyst') {
    return {
      workspace: 'analyst',
      contextArea: 'home',
      contextMode: 'analyst',
    }
  }

  return {
    workspace: 'analyst',
    contextArea: 'home',
    contextMode: 'other',
  }
}
