// features/hub/playerProfile/modules/meetings/logic/meetings.filters.js

import { toKey } from './meetings.utils.js'

export function applyMeetingsFilters(list, filters) {
  const items = Array.isArray(list) ? list : []
  const f = filters || {}

  const typeKey = toKey(f.type)
  const monthKey = toKey(f.month)
  const q = toKey(f.query)

  return items.filter((m) => {
    if (typeKey && toKey(m.typeId) !== typeKey) return false
    if (monthKey && toKey(m.monthKey) !== monthKey) return false

    if (q) {
      const blob = `${m.typeLabel || ''} ${m.statusLabel || ''} ${m.notes || ''} ${m.date || ''} ${m.time || ''}`
      if (!toKey(blob).includes(q)) return false
    }

    return true
  })
}
