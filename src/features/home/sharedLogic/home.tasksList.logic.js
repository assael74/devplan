// features/home/sharedLogic/home.tasksList.logic.js

import {
  ALL_ID,
  DEFAULT_STATUS_FILTER,
  normalizeFilterValue,
  normalizeMultiFilterValue,
  matchesSingleFilter,
  matchesMultiFilter,
} from './tasksFilters.logic.js'

export const TASKS_SORT_OPTIONS = [
  {
    id: 'updatedAt',
    label: 'עודכן לאחרונה',
    idIcon: 'time',
    defaultDirection: 'desc',
  },
  {
    id: 'priority',
    label: 'עדיפות',
    idIcon: 'priorityHigh',
    defaultDirection: 'desc',
  },
  {
    id: 'complexity',
    label: 'מורכבות',
    idIcon: 'complexity',
    defaultDirection: 'desc',
  },
  {
    id: 'title',
    label: 'שם משימה',
    idIcon: 'sortText',
    defaultDirection: 'asc',
  },
]

const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
}

const COMPLEXITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
}

function getTimeValue(value) {
  if (!value) return 0
  if (typeof value === 'number') return value

  if (typeof value?.toMillis === 'function') {
    return value.toMillis()
  }

  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : 0
}

function compareText(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'he')
}

export function createInitialTasksFilters(overrides = {}) {
  return {
    typeFilter: ALL_ID,
    statusFilter: DEFAULT_STATUS_FILTER,
    priorityFilter: ALL_ID,
    ...overrides,
  }
}

export function filterTasks(items = [], filters = {}) {
  const typeFilter = normalizeFilterValue(filters.typeFilter)
  const priorityFilter = normalizeFilterValue(filters.priorityFilter)
  const statusFilter = normalizeMultiFilterValue(
    filters.statusFilter,
    DEFAULT_STATUS_FILTER
  )

  return items.filter((task) => {
    if (!matchesSingleFilter(task?.taskType, typeFilter)) return false
    if (!matchesSingleFilter(task?.priority, priorityFilter)) return false
    if (!matchesMultiFilter(task?.status, statusFilter)) return false

    return true
  })
}

export function sortTasks(items = [], sortBy = 'updatedAt', sortDirection = 'desc') {
  const direction = sortDirection === 'asc' ? 1 : -1

  return [...items].sort((a, b) => {
    if (sortBy === 'priority') {
      const av = PRIORITY_WEIGHT[a?.priority] || 0
      const bv = PRIORITY_WEIGHT[b?.priority] || 0
      return (av - bv) * direction
    }

    if (sortBy === 'complexity') {
      const av = COMPLEXITY_WEIGHT[a?.complexity] || 0
      const bv = COMPLEXITY_WEIGHT[b?.complexity] || 0
      return (av - bv) * direction
    }

    if (sortBy === 'title') {
      return compareText(a?.title, b?.title) * direction
    }

    const av = getTimeValue(a?.updatedAt || a?.createdAt)
    const bv = getTimeValue(b?.updatedAt || b?.createdAt)
    return (av - bv) * direction
  })
}

export function resolveTasksListDomain({
  items = [],
  filters = createInitialTasksFilters(),
  sortBy = 'updatedAt',
  sortDirection = 'desc',
} = {}) {
  const filteredItems = filterTasks(items, filters)
  const sortedItems = sortTasks(filteredItems, sortBy, sortDirection)

  return {
    totalCount: items.length,
    filteredCount: sortedItems.length,
    filteredItems: sortedItems,
  }
}
