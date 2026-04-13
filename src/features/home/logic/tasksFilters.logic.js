// features/home/logic/tasksFilters.logic.js

import { TASK_STATUS } from '../../../shared/tasks/tasks.constants.js'

export const ALL_ID = 'all'

export const DEFAULT_STATUS_FILTER = [
  TASK_STATUS.NEW,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.WAITING,
]

export function normalizeFilterValue(value) {
  return value == null || value === '' ? ALL_ID : String(value)
}

export function normalizeMultiFilterValue(value, fallback = []) {
  if (!Array.isArray(value)) return [...fallback]

  const clean = value
    .map((item) => String(item || ''))
    .filter(Boolean)

  return Array.from(new Set(clean))
}

export function buildOptionMeta(option) {
  return {
    label: option?.label || '',
    count: option?.count ?? 0,
  }
}

export function buildCountMap(items = [], key) {
  const map = new Map()

  for (const item of items) {
    const value = item?.[key]
    if (!value) continue
    map.set(value, (map.get(value) || 0) + 1)
  }

  return map
}

export function withCounts(baseOptions = [], items = [], key, allLabel, allIcon) {
  const countMap = buildCountMap(items, key)
  const total = Array.isArray(items) ? items.length : 0

  return [
    {
      id: ALL_ID,
      label: allLabel,
      idIcon: allIcon,
      count: total,
    },
    ...baseOptions.map((opt) => ({
      ...opt,
      count: countMap.get(opt.id) || 0,
    })),
  ]
}

export function withCountsOnly(baseOptions = [], items = [], key) {
  const countMap = buildCountMap(items, key)

  return baseOptions.map((opt) => ({
    ...opt,
    count: countMap.get(opt.id) || 0,
  }))
}

export function findOpt(options, value) {
  const id = normalizeFilterValue(value)
  return options.find((o) => o.id === id) || options[0] || null
}

export function findManyOpts(options, values = []) {
  const ids = normalizeMultiFilterValue(values)
  return options.filter((option) => ids.includes(option.id))
}

export function matchesSingleFilter(value, filterValue) {
  if (!filterValue || filterValue === ALL_ID) return true
  return String(value || '') === String(filterValue)
}

export function matchesMultiFilter(value, filterValues = []) {
  const ids = normalizeMultiFilterValue(filterValues)
  if (!ids.length) return true
  return ids.includes(String(value || ''))
}

export function areArraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false

  const left = [...a].sort()
  const right = [...b].sort()

  return left.every((item, index) => item === right[index])
}
