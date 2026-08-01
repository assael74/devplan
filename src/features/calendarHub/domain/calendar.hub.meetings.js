import {
  safeId,
  addMinutes,
  toPlayerName,
  buildEventKey,
} from './calendar.hub.utils.js'
import {
  normalizeCalendarEvent,
  resolveMeetingStartAt,
} from './calendar.hub.base.js'

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
