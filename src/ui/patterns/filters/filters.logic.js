/// C:\projects\devplan\src\ui\filters\filters.logic.js

export function hasActiveFilters(filters = {}) {
  return Object.values(filters).some((v) => {
    if (Array.isArray(v)) return v.length > 0
    return v !== 'all' && v !== '' && v != null
  })
}

export function filterData(items = [], filters = {}, rules = {}) {
  if (!Array.isArray(items) || !items.length) return []

  const entries = Object.entries(filters || {}).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0
    return v !== 'all' && v !== '' && v != null
  })
  if (!entries.length) return items

  return items.filter((item) => {
    for (const [k, fVal] of entries) {
      const rule = rules[k]
      const iVal = item[k]

      if (typeof rule === 'function') {
        if (!rule(iVal, fVal, item)) return false
        continue
      }

      if (Array.isArray(fVal)) {
        const fSet = new Set(fVal.map((x) => String(x)))

        if (Array.isArray(iVal)) {
          const ok = iVal.some((x) => fSet.has(String(x)))
          if (!ok) return false
          continue
        }

        const ok = fSet.has(String(iVal))
        if (!ok) return false
        continue
      }

      if (Array.isArray(iVal)) {
        const ok = iVal.some((x) => String(x) === String(fVal))
        if (!ok) return false
        continue
      }

      if (String(iVal) !== String(fVal)) return false
    }
    return true
  })
}

export function getActiveFiltersSummary(filters = {}, groups = []) {
  const active = Object.entries(filters || {}).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0
    return v !== 'all' && v !== '' && v != null
  })

  if (!active.length) return { labels: [], count: 0, text: '' }

  const optionsByKey = {}
  for (const g of groups || []) {
    const m = new Map()
    for (const o of g.options || []) m.set(String(o.value), o)
    optionsByKey[g.key] = m
  }

  const labels = []
  for (const [k, v] of active) {
    if (Array.isArray(v)) {
      for (const one of v) {
        const opt = optionsByKey[k]?.get(String(one))
        labels.push(opt?.label || `${k}: ${String(one)}`)
      }
      continue
    }

    const opt = optionsByKey[k]?.get(String(v))
    labels.push(opt?.label || `${k}: ${String(v)}`)
  }

  return {
    labels,
    count: labels.length,
    text: labels.join(', '),
  }
}
