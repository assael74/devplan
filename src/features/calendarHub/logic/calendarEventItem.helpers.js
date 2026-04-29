// src/features/calendar/logic/calendarEventItem.helpers.js

import { resolveEntityAvatar } from '../../../ui/core/avatars/fallbackAvatar.js'

function pad2(v) {
  return String(v).padStart(2, '0')
}

function toDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function normalizeLocalDay(value) {
  const d = value instanceof Date ? new Date(value) : new Date(value)

  if (Number.isNaN(d.getTime())) {
    const fallback = new Date()
    fallback.setHours(0, 0, 0, 0)
    return fallback
  }

  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameLocalDay(a, b) {
  const x = normalizeLocalDay(a)
  const y = normalizeLocalDay(b)

  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  )
}

export function buildGameTooltipLabel(event) {
  if (!event) return ''

  const rival = event?.meta?.rival || ''

  const isHome = event?.meta?.home
  const homeLabel =
    isHome === true
      ? 'משחק בית'
      : isHome === false
        ? 'משחק חוץ'
        : 'משחק'

  const teamName = event?.teamName || ''
  const clubName = event?.clubName || ''

  // אם יש גם מועדון וגם קבוצה → נחבר
  const teamLabel = [clubName, teamName].filter(Boolean).join(' - ')

  const rivalLabel = rival ? `נגד ${rival}` : ''

  return [homeLabel, teamLabel, rivalLabel]
    .filter(Boolean)
    .join(' · ')
}

export function formatCalendarEventTime(startAt, endAt) {
  const start = toDate(startAt)
  const end = toDate(endAt)

  if (!start) return ''

  const startLabel = `${pad2(start.getHours())}:${pad2(start.getMinutes())}`

  if (!end) return startLabel

  const endLabel = `${pad2(end.getHours())}:${pad2(end.getMinutes())}`

  return `${startLabel} - ${endLabel}`
}

export function buildCalendarEventSubtitle(event) {
  if (!event) return ''

  const teamName = event?.teamName || ''
  const playerName = event?.playerName || ''

  return [teamName, playerName].filter(Boolean).join(' · ')
}

export function buildCalendarEventMetaLabel(event) {
  if (!event) return ''

  if (event?.type === 'game') {
    const rival = event?.meta?.rival || ''
    const venue = event?.meta?.venue || ''

    return [rival, venue].filter(Boolean).join(' · ')
  }

  if (event?.type === 'training') {
    const location = event?.meta?.location || ''
    const pitch = event?.meta?.pitch || ''
    return [location, pitch].filter(Boolean).join(' · ')
  }

  if (event?.type === 'meeting') {
    if (event?.playerId) return 'פגישה אישית'
    return 'פגישה קבוצתית'
  }

  return ''
}

function resolveEventTeamFromContext(event, context) {
  if (!event) return null

  const teams = Array.isArray(context?.teams) ? context.teams : []
  if (!teams.length) return null

  const eventTeamId = event?.teamId || event?.team?.id || ''
  const eventTeamName = event?.teamName || event?.team?.teamName || event?.team?.name || ''

  if (eventTeamId) {
    const byId = teams.find((team) => team?.id === eventTeamId)
    if (byId) return byId
  }

  if (eventTeamName) {
    const byName = teams.find((team) => {
      const teamName = team?.teamName || team?.name || ''
      return teamName === eventTeamName
    })
    if (byName) return byName
  }

  return null
}

export function buildCalendarEventMetaPhoto(event, context) {
  if (!event) return ''

  const team =
    resolveEventTeamFromContext(event, context) ||
    event?.team ||
    null

  if (!team) return ''

  return (
    resolveEntityAvatar({
      entityType: 'team',
      entity: team,
      parentEntity: team?.club || null,
      subline: team?.club?.clubName || team?.club?.name || '',
    }) || ''
  )
}

export function buildCalendarEventStatusMeta(event) {
  const status =
    event?.status ||
    event?.statusId ||
    event?.meta?.status ||
    ''

  const normalizedStatus = String(status || '').trim()

  if (!normalizedStatus) {
    return {
      id: 'planned',
      label: 'מתוכנן',
      idIcon: 'calendar',
      color: 'primary',
    }
  }

  const map = {
    planned: {
      id: 'planned',
      label: 'מתוכנן',
      idIcon: 'calendar',
      color: 'primary',
    },

    scheduled: {
      id: 'scheduled',
      label: 'מתוכנן',
      idIcon: 'calendar',
      color: 'primary',
    },

    new: {
      id: 'new',
      label: 'חדש',
      idIcon: 'calendar',
      color: 'primary',
    },

    done: {
      id: 'done',
      label: 'בוצע',
      idIcon: 'check',
      color: 'success',
    },

    completed: {
      id: 'completed',
      label: 'בוצע',
      idIcon: 'check',
      color: 'success',
    },

    canceled: {
      id: 'canceled',
      label: 'בוטל',
      idIcon: 'close',
      color: 'danger',
    },

    cancelled: {
      id: 'cancelled',
      label: 'בוטל',
      idIcon: 'close',
      color: 'danger',
    },

    postponed: {
      id: 'postponed',
      label: 'נדחה',
      idIcon: 'time',
      color: 'warning',
    },

    pending: {
      id: 'pending',
      label: 'ממתין',
      idIcon: 'time',
      color: 'warning',
    },
  }

  return map[normalizedStatus] || {
    id: normalizedStatus,
    label: normalizedStatus,
    idIcon: 'calendar',
    color: 'neutral',
  }
}
