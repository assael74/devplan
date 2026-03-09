export const safeId = (v) => (v == null ? '' : String(v))
export const safeStr = (v) => (v == null ? '' : String(v).trim())
export const safeArr = (v) => (Array.isArray(v) ? v : [])
export const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
export const safeBool = (v) => v === true

export const toMillis = (v) => {
  if (v == null) return 0
  if (typeof v === 'number') return v
  if (typeof v?.toMillis === 'function') return v.toMillis()

  const t = new Date(v).getTime()
  return Number.isFinite(t) ? t : 0
}

export const startOfDay = (value) => {
  const ms = toMillis(value)
  if (!ms) return 0
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export const getWeekStartFromDate = (value) => {
  const ms = toMillis(value)
  if (!ms) return 0

  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())

  return d.getTime()
}

export const getWeekEndFromStart = (weekStart) => {
  if (!weekStart) return 0
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export const buildWeekIdFromStart = (weekStart) => {
  if (!weekStart) return ''
  const d = new Date(weekStart)
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const normalizeIds = (v) => {
  if (Array.isArray(v)) return v.map(safeId).filter(Boolean)
  const id = safeId(v)
  return id ? [id] : []
}
