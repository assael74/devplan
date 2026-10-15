// src/features/playersDatabase/ui/pages/teamPage/information/model/teamRosterLoad.presentation.js

import { getFullDateIl } from '../../../../../../../shared/format/dateUtils.js'

const relativeTime = new Intl.RelativeTimeFormat('he', { numeric: 'auto' })

const toDate = value => {
  const normalized = typeof value?.toDate === 'function'
    ? value.toDate()
    : Number.isFinite(Number(value?.seconds))
      ? Number(value.seconds) * 1000
      : value
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatTeamLoadAge = (value, now = Date.now()) => {
  if (!value) return ''

  const date = toDate(value)
  if (!date) return ''

  const minutes = Math.max(0, Math.floor((now - date.getTime()) / 60000))
  let age = 'הרגע'
  if (minutes >= 525600) age = relativeTime.format(-Math.floor(minutes / 525600), 'year')
  else if (minutes >= 43200) age = relativeTime.format(-Math.floor(minutes / 43200), 'month')
  else if (minutes >= 1440) age = relativeTime.format(-Math.floor(minutes / 1440), 'day')
  else if (minutes >= 60) age = relativeTime.format(-Math.floor(minutes / 60), 'hour')
  else if (minutes >= 1) age = relativeTime.format(-minutes, 'minute')

  return `${getFullDateIl(date)} · ${age}`
}
