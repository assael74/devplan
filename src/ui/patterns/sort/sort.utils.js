// ui/patterns/sort/sort.utils.js

export const DEFAULT_SORT_BY = 'level'
export const DEFAULT_SORT_DIRECTION = 'desc'

export function getSortDirectionIcon(sortDirection) {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

export function getSortOptionLabel(sortOptions = [], sortBy, fallback = '') {
  const item = Array.isArray(sortOptions)
    ? sortOptions.find((x) => x.id === sortBy)
    : null

  return item?.label || fallback || ''
}

export function normalizeSortState(sortBy, sortDirection) {
  return {
    by: sortBy || DEFAULT_SORT_BY,
    direction: sortDirection || DEFAULT_SORT_DIRECTION,
  }
}

export function buildNextSortState({
  currentBy,
  currentDirection,
  nextSortBy,
  sortOptions = [],
  fallbackDirection = DEFAULT_SORT_DIRECTION,
}) {
  const nextMeta = Array.isArray(sortOptions)
    ? sortOptions.find((x) => x.id === nextSortBy)
    : null

  if (!nextMeta) {
    return {
      by: currentBy || DEFAULT_SORT_BY,
      direction: currentDirection || DEFAULT_SORT_DIRECTION,
    }
  }

  if ((currentBy || DEFAULT_SORT_BY) === nextSortBy) {
    return {
      by: nextSortBy,
      direction: (currentDirection || DEFAULT_SORT_DIRECTION) === 'asc' ? 'desc' : 'asc',
    }
  }

  return {
    by: nextSortBy,
    direction: nextMeta.defaultDirection || fallbackDirection,
  }
}
