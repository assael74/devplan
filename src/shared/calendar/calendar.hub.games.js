import {
  safeId,
  addMinutes,
  extractGame,
  buildEventKey,
} from './calendar.hub.utils.js'
import {
  normalizeCalendarEvent,
  resolveGameStartAt,
} from './calendar.hub.base.js'

export function normalizeGameEvent(gameRaw, team) {
  const g = extractGame(gameRaw)
  const startAt = resolveGameStartAt(g)
  if (!startAt) return null

  const durationMin = Number(g?.gameDuration ?? g?.durationMin ?? 90)
  const endAt = addMinutes(startAt, durationMin)

  const rival = g?.rivel || g?.rival || ''
  const competition = g?.type || g?.competition || ''
  const home =
    typeof g?.home === 'boolean'
      ? g.home
      : typeof g?.isHome === 'boolean'
        ? g.isHome
        : null

  return normalizeCalendarEvent({
    id: safeId(g?.id) || safeId(gameRaw?.gameId),
    eventKey: buildEventKey({
      source: 'team',
      type: 'game',
      entityId: team?.id,
      itemId: safeId(g?.id) || safeId(gameRaw?.gameId),
      startAt,
    }),

    type: 'game',
    source: 'team',

    startAt,
    endAt,
    durationMin,

    title: g?.title || g?.rival || 'משחק',
    status: g?.status || 'planned',

    teamId: team?.id,
    teamName: team?.teamName,
    clubId: team?.clubId,
    clubName: team?.club?.clubName || team?.clubName || '',

    meta: {
      kind: 'game',
      rawId: safeId(g?.id) || safeId(gameRaw?.gameId) || '',
      rival,
      competition,
      home,
    },
  })
}
