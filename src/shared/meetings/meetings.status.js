// src/shared/meetings/meetings.status.js

export function normalizeMeetingStatus(input) {
  // Canonical:
  // { current: { id, time }, history: [{id,time}, ...] }

  const empty = { current: { id: '', time: 0 }, history: [] }
  if (!input) return empty

  // string legacy: "new"
  if (typeof input === 'string') {
    const id = String(input || '')
    const entry = { id, time: 0 }
    return { current: entry, history: id ? [entry] : [] }
  }

  // object legacy: { id, time }
  if (input && typeof input === 'object' && input.id && !input.current) {
    const entry = { id: String(input.id || ''), time: Number(input.time || 0) }
    return { current: entry, history: entry.id ? [entry] : [] }
  }

  // new: { current, history }
  if (input?.current) {
    const cur = {
      id: String(input.current?.id || ''),
      time: Number(input.current?.time || 0),
    }

    const historyRaw = Array.isArray(input.history) ? input.history : []
    const history = historyRaw
      .map((h) => {
        if (!h) return null
        if (typeof h === 'string') return { id: String(h || ''), time: 0 }
        if (typeof h === 'object') return { id: String(h.id || ''), time: Number(h.time || 0) }
        return null
      })
      .filter(Boolean)
      .filter((h) => h.id)

    // אם אין היסטוריה – נכניס current אם יש id
    if (!history.length && cur.id) history.push({ ...cur })

    return { current: cur, history }
  }

  return empty
}

export function getStatusId(status) {
  const s = normalizeMeetingStatus(status)
  return s.current?.id || ''
}

export function buildNextStatus(prevStatus, nextId, now = Date.now()) {
  const prev = normalizeMeetingStatus(prevStatus)
  const prevId = prev.current?.id || ''
  const id = String(nextId || '').trim()
  if (!id || id === prevId) return prev

  const entry = { id, time: now }
  const history = Array.isArray(prev.history) ? [...prev.history] : []
  history.push(entry)

  return { current: entry, history }
}
