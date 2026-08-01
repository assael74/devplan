import {
  safeArr,
  safeId,
  safeDate,
  addMinutes,
  toPlayerName,
  extractGame,
  toDateTime,
  buildEventKey,
} from './calendar.hub.utils.js'

function resolveMeetingStartAt(meeting) {
  return toDateTime(meeting?.meetingDate, meeting?.meetingHour || '')
}

function resolveGameStartAt(game) {
  return toDateTime(game?.gameDate, game?.gameHour || '')
}

function resolveTrainingStartAt(training) {
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

export function normalizeTrainingEvent(trainingRaw, team) {
  const startAt = resolveTrainingStartAt(trainingRaw)
  if (!startAt) return null

  return normalizeCalendarEvent({
    id: safeId(trainingRaw?.id),
    eventKey: buildEventKey({
      source: 'team',
      type: 'training',
      entityId: team?.id,
      itemId: safeId(trainingRaw?.id),
      startAt,
    }),

    type: 'training',
    source: 'team',

    startAt,
    endAt: addMinutes(startAt, Number(trainingRaw?.durationMin || 90)),
    durationMin: Number(trainingRaw?.durationMin || 90),

    title: trainingRaw?.title || trainingRaw?.name || 'אימון',
    status: trainingRaw?.status || 'planned',

    teamId: team?.id,
    teamName: team?.teamName,
    clubId: team?.clubId,
    clubName: team?.club?.clubName || team?.clubName || '',

    meta: {
      kind: 'training',
      location: trainingRaw?.location || '',
      pitch: trainingRaw?.pitch || '',
      weekId: trainingRaw?.weekId || '',
    },
  })
}

export function normalizeTeamMeetingEvent(meetingRaw, team) {
  const startAt = resolveMeetingStartAt(meetingRaw)
  if (!startAt) return null

  return normalizeCalendarEvent({
    id: safeId(meetingRaw?.id),
    eventKey: buildEventKey({
      source: 'team',
      type: 'meeting',
      entityId: team?.id,
      itemId: safeId(meetingRaw?.id),
      startAt,
    }),

    type: 'meeting',
    source: 'team',

    startAt,
    endAt: addMinutes(startAt, Number(meetingRaw?.durationMin || 60)),
    durationMin: Number(meetingRaw?.durationMin || 60),

    title: meetingRaw?.title || 'פגישה קבוצתית',
    status: meetingRaw?.status || 'planned',

    teamId: team?.id,
    teamName: team?.teamName,
    clubId: team?.clubId,
    clubName: team?.club?.clubName || team?.clubName || '',

    meta: {
      kind: 'meeting_team',
      notes: meetingRaw?.notes || '',
    },
  })
}

export function normalizePlayerMeetingEvent(meetingRaw, player) {
  const startAt = resolveMeetingStartAt(meetingRaw)
  if (!startAt) return null

  return normalizeCalendarEvent({
    id: safeId(meetingRaw?.id),
    eventKey: buildEventKey({
      source: 'player',
      type: 'meeting',
      entityId: player?.id,
      itemId: safeId(meetingRaw?.id),
      startAt,
    }),

    type: 'meeting',
    source: 'player',

    startAt,
    endAt: addMinutes(startAt, Number(meetingRaw?.durationMin || 45)),
    durationMin: Number(meetingRaw?.durationMin || 45),

    title: meetingRaw?.title || 'פגישה אישית',
    status: meetingRaw?.status || 'planned',

    teamId: player?.teamId || '',
    teamName: player?.teamName || '',
    playerId: player?.id,
    playerName: toPlayerName(player),

    clubId: player?.clubId || '',
    clubName: player?.clubName || '',

    meta: {
      kind: 'meeting_player',
      notes: meetingRaw?.notes || '',
    },
  })
}
