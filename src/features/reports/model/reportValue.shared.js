// features/reports/model/reportValue.shared.js

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

export function sanitizeReportValue(value) {
  if (
    value === undefined ||
    typeof value === 'function' ||
    typeof value === 'symbol'
  ) {
    return undefined
  }

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value && typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }

  if (Array.isArray(value)) {
    return value
      .map(item => sanitizeReportValue(item))
      .filter(item => item !== undefined)
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce((result, [key, item]) => {
      const sanitized = sanitizeReportValue(item)

      if (sanitized !== undefined) {
        result[key] = sanitized
      }

      return result
    }, {})
  }

  return String(value)
}

export function asReportArray(value) {
  return Array.isArray(value) ? value : []
}

export function asReportObject(value) {
  return isPlainObject(value) ? value : {}
}

export function asReportText(value, fallback = '') {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return String(value)
}

export function asReportNumber(value, fallback = 0) {
  const number = Number(value)

  return Number.isFinite(number) ? number : fallback
}

export function pickReportEntity(model = {}) {
  const entity = asReportObject(model.entity)

  return sanitizeReportValue({
    type: entity.type || 'team',
    id: entity.id || '',
    name: entity.name || '',
    avatarUrl: entity.avatarUrl || '',
  })
}

export function pickReportMetaItems(model = {}) {
  return sanitizeReportValue(asReportArray(model.metaItems))
}

export function pickReportColumns(model = {}) {
  return sanitizeReportValue(asReportArray(model.columns))
}

export function pickReportRows(model = {}) {
  return sanitizeReportValue(asReportArray(model.rows))
}

export function pickReportFilters(model = {}) {
  return sanitizeReportValue({
    activeFilters: asReportArray(model.activeFilters),
    hasActiveFilters: model.hasActiveFilters === true,
  })
}

export function pickReportCounts(model = {}) {
  return sanitizeReportValue({
    rowsCount: asReportNumber(model.rowsCount),
    totalCount: asReportNumber(model.totalCount),
    activeCount: asReportNumber(model.activeCount),
    withTargetsCount: asReportNumber(model.withTargetsCount),
    printPages: asReportNumber(model.printPages, 1),
  })
}
