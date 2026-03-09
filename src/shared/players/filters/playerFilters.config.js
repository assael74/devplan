// src/shared/players/filters/playerFilters.config.js

const safe = (v) => (v == null ? '' : String(v))

export const playerInitialFilters = {
  active: 'all',
  type: 'all',
  candidate: 'all',
}

export const playerFilterRules = {
  active: (_iVal, fVal, row) => {
    const f = safe(fVal).toLowerCase()
    if (!f || f === 'all') return true
    const isActive = !!row?.active
    if (f === 'active') return isActive
    if (f === 'nonactive' || f === 'non_active' || f === 'non-active') return !isActive
    return true
  },

  type: (_iVal, fVal, row) => {
    const f = safe(fVal).toLowerCase()
    if (!f || f === 'all') return true
    return safe(row?.type).toLowerCase() === f
  },

  candidate: (_iVal, fVal, row) => {
    const f = safe(fVal).toLowerCase()
    if (!f || f === 'all') return true
    return safe(row?.candidate).toLowerCase() === f
  },
}
