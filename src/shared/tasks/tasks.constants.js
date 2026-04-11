// shared/tasks/tasks.constants.js

import { getEntityColors } from '../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)


export const TASK_WORKSPACES = {
  ANALYST: 'analyst',
  APP: 'app',
}

export const TASK_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  WAITING: 'waiting',
  DONE: 'done',
  ARCHIVED: 'archived',
}

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

export const TASK_COMPLEXITY = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
}

export const ANALYST_TASK_TYPES = {
  MATCH: 'match',
  PLAYER: 'player',
  TEAM: 'team',
  VIDEO: 'video',
  VIDEO_ANALYSIS: 'video_analysis',
  MEETING: 'meeting',
  FOLLOW_UP: 'follow_up',
  GENERAL: 'general',
}

export const APP_TASK_TYPES = {
  BUG: 'bug',
  UI: 'ui',
  MOBILE: 'mobile',
  FEATURE: 'feature',
  REFACTOR: 'refactor',
  DATA: 'data',
  GENERAL: 'general',
}

export const taskWorkspaceOptions = [
  {
    id: TASK_WORKSPACES.ANALYST,
    label: 'אנליסט',
    idIcon: 'Analyst',
    color: c('taskAnalyst').accent,
  },
  {
    id: TASK_WORKSPACES.APP,
    label: 'פיתוח אפליקציה',
    idIcon: 'app',
    color: c('taskApp').accent,
  },
]

export const taskStatusOptions = [
  {
    id: TASK_STATUS.NEW,
    label: 'חדש',
    idIcon: 'newTask',
    color: c('status').success.solid,
  },
  {
    id: TASK_STATUS.IN_PROGRESS,
    label: 'בתהליך',
    idIcon: 'inProgressTask',
    color: c('status').warning.info,
  },
  {
    id: TASK_STATUS.WAITING,
    label: 'ממתין',
    idIcon: 'waitingTask',
    color: c('status').warning.solid,
  },
  {
    id: TASK_STATUS.DONE,
    label: 'בוצע',
    idIcon: 'doneTask',
    color: c('status').success.solid,
  },
  {
    id: TASK_STATUS.ARCHIVED,
    label: 'ארכיון',
    idIcon: 'archivedTask',
    color: '',
  },
]

export const taskPriorityOptions = [
  {
    id: TASK_PRIORITY.LOW,
    label: 'נמוכה',
    idIcon: 'priorityLow',
    color: c('status').success.solid,
  },
  {
    id: TASK_PRIORITY.MEDIUM,
    label: 'בינונית',
    idIcon: 'priorityMedium',
    color: c('status').warning.solid,
  },
  {
    id: TASK_PRIORITY.HIGH,
    label: 'גבוהה',
    idIcon: 'priorityHigh',
    color: c('status').danger.solid,
  },
]

export const taskComplexityOptions = [
  {
    id: TASK_COMPLEXITY.SMALL,
    label: 'קטנה',
    idIcon: 'complexityLow',
    color: c('status').success.solid,
  },
  {
    id: TASK_COMPLEXITY.MEDIUM,
    label: 'בינונית',
    idIcon: 'complexityMedium',
    color: c('status').warning.solid,
  },
  {
    id: TASK_COMPLEXITY.LARGE,
    label: 'גדולה',
    idIcon: 'complexityHigh',
    color: c('status').danger.solid,
  },
]

export const taskTypeOptionsByWorkspace = {
  [TASK_WORKSPACES.ANALYST]: [
    {
      id: ANALYST_TASK_TYPES.MATCH,
      label: 'משחק',
      idIcon: 'game',
      color: c('game').accent,
    },
    {
      id: ANALYST_TASK_TYPES.PLAYER,
      label: 'שחקן',
      idIcon: 'player',
      color: c('player').accent,
    },
    {
      id: ANALYST_TASK_TYPES.TEAM,
      label: 'קבוצה',
      idIcon: 'team',
      color: c('team').accent,
    },
    {
      id: ANALYST_TASK_TYPES.VIDEO,
      label: 'וידאו',
      idIcon: 'videoGeneral',
      color: c('videoGeneral').accent,
    },
    {
      id: ANALYST_TASK_TYPES.VIDEO_ANALYSIS,
      label: 'ניתוח וידאו',
      idIcon: 'videoAnalysis',
      color: c('videoAnalysis').accent,
    },
    {
      id: ANALYST_TASK_TYPES.MEETING,
      label: 'פגישה',
      idIcon: 'meeting',
      color: c('player').accent,
    },
    {
      id: ANALYST_TASK_TYPES.FOLLOW_UP,
      label: 'מעקב',
      idIcon: 'followUpTask',
      color: '',
    },
    {
      id: ANALYST_TASK_TYPES.GENERAL,
      label: 'כללי',
      idIcon: 'task',
      color: '',
    },
  ],
  [TASK_WORKSPACES.APP]: [
    {
      id: APP_TASK_TYPES.BUG,
      label: 'באג',
      idIcon: 'bug',
      color: '',
    },
    {
      id: APP_TASK_TYPES.UI,
      label: 'ממשק',
      idIcon: 'ui',
      color: '',
    },
    {
      id: APP_TASK_TYPES.MOBILE,
      label: 'מובייל',
      idIcon: 'mobile',
      color: '',
    },
    {
      id: APP_TASK_TYPES.FEATURE,
      label: 'פיצ׳ר',
      idIcon: 'feature',
      color: '',
    },
    {
      id: APP_TASK_TYPES.REFACTOR,
      label: 'ריפקטור',
      idIcon: 'refactor',
      color: '',
    },
    {
      id: APP_TASK_TYPES.DATA,
      label: 'דאטה',
      idIcon: 'data',
      color: '',
    },
    {
      id: APP_TASK_TYPES.GENERAL,
      label: 'כללי',
      idIcon: 'app',
      color: '',
    },
  ],
}

export function getTaskTypeOptionsByWorkspace(workspace) {
  return taskTypeOptionsByWorkspace[workspace] || []
}

export function getTaskWorkspaceMeta(id) {
  return taskWorkspaceOptions.find((item) => item.id === id) || null
}

export function getTaskStatusMeta(id) {
  return taskStatusOptions.find((item) => item.id === id) || null
}

export function getTaskPriorityMeta(id) {
  return taskPriorityOptions.find((item) => item.id === id) || null
}

export function getTaskComplexityMeta(id) {
  return taskComplexityOptions.find((item) => item.id === id) || null
}

export function getTaskTypeMeta(workspace, typeId) {
  const options = getTaskTypeOptionsByWorkspace(workspace)
  return options.find((item) => item.id === typeId) || null
}
