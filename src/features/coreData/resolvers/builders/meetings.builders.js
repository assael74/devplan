import {
  safeArr,
  safeId,
  safeStr,
  toMillis,
  getWeekStartFromDate,
  getWeekEndFromStart,
  buildWeekIdFromStart,
  normalizeIds,
} from '../../utils/data.utils.js'
import { uniqBy } from '../../utils/map.utils.js'

const parseDateTime = (dateValue, hourValue = '') => {
  const dateStr = safeStr(dateValue)
  const hourStr = safeStr(hourValue)

  if (!dateStr && !hourStr) return 0

  if (dateStr && hourStr) {
    const ms = new Date(`${dateStr}T${hourStr}`).getTime()
    if (Number.isFinite(ms)) return ms
  }

  const fallback = toMillis(dateStr || hourStr)
  return Number.isFinite(fallback) ? fallback : 0
}

export const getMeetingDate = (meeting) =>
  meeting?.meetingDate ||
  meeting?.date ||
  meeting?.createdAt ||
  meeting?.updatedAt ||
  0

const sortMeetingsAsc = (arr) =>
  safeArr(arr).slice().sort((a, b) => {
    const ad = Number(a?.eventSortTime || 0)
    const bd = Number(b?.eventSortTime || 0)
    return ad - bd
  })

export const normalizeMeeting = (meeting = {}) => {
  const meetingDate = getMeetingDate(meeting)

  const eventDate =
    parseDateTime(meetingDate, meeting?.meetingHour) ||
    toMillis(meetingDate) ||
    toMillis(meeting?.createdAt) ||
    0

  const weekStart = getWeekStartFromDate(eventDate)
  const weekEnd = getWeekEndFromStart(weekStart)
  const weekId = safeStr(meeting?.weekId) || buildWeekIdFromStart(weekStart)

  return {
    ...meeting,
    id: safeId(meeting?.id),
    eventType: 'meeting',
    sourceType: 'meeting',
    eventDate,
    eventSortTime: eventDate,
    weekId,
    weekStart,
    weekEnd,
    teamId: safeId(meeting?.teamId),
  }
}

export const buildMeetingsByPlayerId = (meetingsBase = []) => {
  const map = new Map()

  const add = (playerId, meeting) => {
    const pid = safeId(playerId)
    const mid = safeId(meeting?.id)
    if (!pid || !mid) return

    if (!map.has(pid)) map.set(pid, [])
    map.get(pid).push(normalizeMeeting(meeting))
  }

  for (const meeting of safeArr(meetingsBase)) {
    const playerIds = [
      ...normalizeIds(meeting?.playerId),
      ...normalizeIds(meeting?.playersId),
    ]

    for (const playerId of playerIds) add(playerId, meeting)
  }

  for (const [playerId, arr] of map.entries()) {
    map.set(
      playerId,
      sortMeetingsAsc(uniqBy(arr, (item) => safeId(item?.id)))
    )
  }

  return map
}

export const buildMeetingsByTeamId = (teamsBase = []) => {
  const map = new Map()

  for (const team of safeArr(teamsBase)) {
    const teamId = safeId(team?.id)
    if (!teamId) continue

    const rawMeetings =
      Array.isArray(team?.teamMeetings) ? team.teamMeetings
      : Array.isArray(team?.meetings) ? team.meetings
      : []

    const meetings = sortMeetingsAsc(
      uniqBy(
        rawMeetings.map((meeting) =>
          normalizeMeeting({ ...meeting, teamId: meeting?.teamId || teamId })
        ),
        (item) => safeId(item?.id)
      )
    )

    map.set(teamId, meetings)
  }

  return map
}

export const buildMeetingsByWeekId = (meetingsArr = []) => {
  const map = new Map()

  for (const raw of safeArr(meetingsArr)) {
    const meeting = normalizeMeeting(raw)
    const weekId = safeStr(meeting?.weekId)
    const meetingId = safeId(meeting?.id)

    if (!weekId || !meetingId) continue

    if (!map.has(weekId)) map.set(weekId, [])
    map.get(weekId).push(meeting)
  }

  for (const [weekId, arr] of map.entries()) {
    map.set(
      weekId,
      sortMeetingsAsc(uniqBy(arr, (item) => safeId(item?.id)))
    )
  }

  return map
}
