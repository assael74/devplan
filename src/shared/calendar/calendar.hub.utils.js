import { safeId, safeArr } from '../format/data.utils.js'

export { safeId, safeArr }

export const safeDate = (value) => {
  if (!value) return null

  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export const addMinutes = (date, minutes = 0) => {
  if (!date) return null
  return new Date(date.getTime() + Number(minutes || 0) * 60000)
}

export const toPlayerName = (player) =>
  [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ').trim()

export const extractGame = (g) => g?.game || g

export function toDateTime(dateValue, hourValue = '') {
  if (!dateValue) return null

  const base = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue)
  if (Number.isNaN(base.getTime())) return null

  const rawHour = String(hourValue || '').trim()

  if (!rawHour) {
    base.setSeconds(0, 0)
    return base
  }

  const match = rawHour.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    base.setSeconds(0, 0)
    return base
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  base.setHours(hours, minutes, 0, 0)
  return base
}

export function buildEventKey({
  source = '',
  type = '',
  entityId = '',
  itemId = '',
  startAt = null,
}) {
  const ts = startAt instanceof Date ? startAt.toISOString() : ''
  return [source, type, entityId, itemId, ts].filter(Boolean).join('__')
}
