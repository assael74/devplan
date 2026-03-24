import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'
import { toValidDate } from './schedule.date.js'

export const formatShortDateIl = (value) => {
  const d = toValidDate(value)
  if (!d) return ''

  return d.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
  })
}

export const buildWeekRangeLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return ''

  return `${formatShortDateIl(startDate)} - ${formatShortDateIl(endDate)}`
}

export const formatDurationLabel = (duration) => {
  const n = Number(duration)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `${n} דק׳`
}

export const getCompactTrainingLabel = (row) => {
  if (!row) return '—'
  if (row?.isEmpty) return 'אין אימון'

  const parts = [row?.hour, formatDurationLabel(row?.duration)].filter(Boolean)
  return parts.join(' · ') || 'אימון'
}

export const getCompactTrainingSubLabel = (row) => {
  if (!row || row?.isEmpty) return ''

  const dateObj = toValidDate(row?.date)
  const dateLabel = dateObj ? getFullDateIl(dateObj) : ''

  return [row?.typeLabel, row?.location, dateLabel].filter(Boolean).join(' · ')
}
