// src/features/calendar/logic/calendarEventItem.helpers.js

function pad2(v) {
  return String(v).padStart(2, '0')
}

function toDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
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
