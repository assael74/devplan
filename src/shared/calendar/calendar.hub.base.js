import {
  safeId,
  safeDate,
  addMinutes,
  toDateTime,
  buildEventKey,
} from './calendar.hub.utils.js'

export function resolveMeetingStartAt(meeting) {
  return toDateTime(meeting?.meetingDate, meeting?.meetingHour || '')
}

export function resolveGameStartAt(game) {
  return toDateTime(game?.gameDate, game?.gameHour || '')
}

export function resolveTrainingStartAt(training) {
  return toDateTime(
    training?.trainingDate || training?.date || training?.startAt,
    training?.hour || training?.trainingHour || ''
  )
}

export function normalizeCalendarEvent(raw = {}) {
  const startAt = safeDate(raw?.startAt)
  if (!startAt) return null

  const durationMin = Math.max(15, Number(raw?.durationMin ?? 60))
  const endAt = safeDate(raw?.endAt) || addMinutes(startAt, durationMin)

  const type = raw?.type || 'meeting'
  const source = raw?.source || 'unknown'
  const teamId = safeId(raw?.teamId)
  const playerId = safeId(raw?.playerId)
  const itemId = safeId(raw?.id)

  return {
    id: itemId || buildEventKey({ source, type, entityId: teamId || playerId, startAt }),
    eventKey:
      raw?.eventKey ||
      buildEventKey({
        source,
        type,
        entityId: playerId || teamId,
        itemId,
        startAt,
      }),

    type,
    source,

    startAt,
    endAt,
    durationMin,

    title: raw?.title || 'ללא כותרת',
    status: raw?.status || 'planned',

    teamId: teamId || '',
    teamName: raw?.teamName || '',

    playerId: playerId || '',
    playerName: raw?.playerName || '',

    clubId: safeId(raw?.clubId) || '',
    clubName: raw?.clubName || '',

    meta: {
      rawId: itemId || '',
      rival: raw?.meta?.rival || '',
      venue: raw?.meta?.venue || '',
      kind: raw?.meta?.kind || '',
      ...raw?.meta,
    },
  }
}
