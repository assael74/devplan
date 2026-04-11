// features/home/logic/tasksFilters.logic.js

export const ALL_ID = 'all'

export function normalizeFilterValue(value) {
  return value == null || value === '' ? ALL_ID : String(value)
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

export function findOpt(options, value) {
  const id = normalizeFilterValue(value)
  return options.find((o) => o.id === id) || options[0] || null
}
