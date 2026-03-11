// domains/player/meetings/logic/playerMeetings.domain.logic.js

import { DOMAIN_STATE } from '../../../../../preview.state'
import { getFullDateIl } from '../../../../../../../../../shared/format/dateUtiles.js'
import { clean } from '../../../../../../../../../shared/format/string.js'
import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../../../../shared/meetings/meetings.constants.js'
import { getStatusId } from '../../../../../../../../../shared/meetings/meetings.status.js'

const safe = (v) => (v == null ? '' : String(v))

const typeMetaById = Object.fromEntries((MEETING_TYPES || []).map((x) => [x.id, x]))
const statusMetaById = Object.fromEntries((MEETING_STATUSES || []).map((x) => [x.id, x]))

const toMsAny = (meeting) => {
  const ms = Number(meeting?._ms || 0)
  if (Number.isFinite(ms) && ms > 0) return ms

  const dateRaw = meeting?.meetingDate || meeting?.date
  if (!dateRaw) return 0

  const hourRaw = meeting?.meetingHour || meeting?.time || ''
  const joined = hourRaw ? `${dateRaw}T${hourRaw}` : dateRaw
  const d = new Date(joined)
  return Number.isNaN(d.getTime()) ? 0 : d.getTime()
}

const buildHaystack = (row) =>
  [
    row?.dateRaw,
    row?.dateLabel,
    row?.hourRaw,
    row?.meetingFor,
    row?.typeId,
    row?.typeLabel,
    row?.statusId,
    row?.statusLabel,
    row?.notes,
    row?.videoId,
    row?.video?.name,
    row?.id,
  ]
    .join(' ')
    .toLowerCase()

const buildVideosByMeetingId = (player) => {
  const videos = Array.isArray(player?.videos) ? player.videos : []

  const map = new Map()

  videos.forEach((video) => {
    const meetingId = clean(video?.meetingId)
    if (!meetingId) return
    if (!map.has(meetingId)) map.set(meetingId, [])
    map.get(meetingId).push(video)
  })

  return map
}

const enrichMeetingRow = (meeting = {}, player = null, videosByMeetingId = new Map()) => {
  const typeId = clean(meeting?.type || meeting?.typeId)
  const statusId = clean(getStatusId(meeting?.status) || meeting?.statusId || meeting?.status)

  const typeMeta = typeMetaById[typeId] || null
  const statusMeta = statusMetaById[statusId] || null

  const meetingId = clean(meeting?.id)
  const linkedVideos = videosByMeetingId.get(meetingId) || []
  const video = linkedVideos[0] || null

  const dateRaw = clean(meeting?.meetingDate || meeting?.date)
  const hourRaw = clean(meeting?.meetingHour || meeting?.time)
  const dateLabel = dateRaw ? getFullDateIl(dateRaw) || '—' : '—'
  const meetingFor = clean(meeting?.meetingFor)
  const notes = clean(meeting?.notes)
  const videoId = clean(video?.id || meeting?.videoId)
  const ts = toMsAny(meeting)

  return {
    ...meeting,
    player: player || null,
    video,
    videos: linkedVideos,
    id: meetingId,
    dateRaw,
    dateLabel,
    hourRaw,
    meetingFor,
    typeId,
    typeLabel: typeMeta?.labelH || typeId || '—',
    typeIcon: typeMeta?.idIcon || 'meetings',
    statusId,
    statusLabel: statusMeta?.labelH || statusId || '—',
    statusIcon: statusMeta?.idIcon || 'meetings',
    notes,
    hasNotes: !!notes,
    videoId,
    hasVideo: !!video,
    ts,
    isFuture: ts > Date.now(),
    raw: meeting,
  }
}

const buildSummary = (rows = []) => {
  const total = rows.length
  const withVideo = rows.filter((x) => x.hasVideo).length
  const withNotes = rows.filter((x) => x.hasNotes).length
  const upcoming = rows.filter((x) => x.isFuture).sort((a, b) => a.ts - b.ts)
  const completed = rows.filter((x) => !x.isFuture).sort((a, b) => b.ts - a.ts)
  const nextMeeting = upcoming[0] || null
  const lastMeeting = completed[0] || null

  return {
    total,
    withVideo,
    withNotes,
    upcomingCount: upcoming.length,
    completedCount: completed.length,
    nextMeeting,
    lastMeeting,
  }
}

export const formatMeetingLabel = (meeting) => {
  if (!meeting) return ''

  const date = meeting?.dateLabel || meeting?.meetingDate || ''
  const hour = meeting?.hourRaw || meeting?.meetingHour || ''

  return [date, hour].filter(Boolean).join(' • ')
}

export const resolvePlayerMeetingsDomain = (player) => {
  const baseRows = Array.isArray(player?.meetings) ? player.meetings : []
  const videosByMeetingId = buildVideosByMeetingId(player)
  const rows = baseRows.map((meeting) => enrichMeetingRow(meeting, player, videosByMeetingId))
  const summary = buildSummary(rows)

  let state = DOMAIN_STATE.EMPTY
  if (rows.length === 0) state = DOMAIN_STATE.EMPTY
  else if (rows.some((x) => !x.dateRaw || !x.typeId)) state = DOMAIN_STATE.PARTIAL
  else state = DOMAIN_STATE.OK

  return {
    state,
    rows,
    summary,
  }
}

export const filterPlayerMeetings = (
  rows,
  { q, typeFilter = 'all', statusFilter = 'all', videoFilter = 'all' } = {}
) => {
  const search = safe(q).trim().toLowerCase()
  const tf = safe(typeFilter).trim().toLowerCase()
  const sf = safe(statusFilter).trim().toLowerCase()
  const vf = safe(videoFilter).trim().toLowerCase()

  return (rows || []).filter((row) => {
    if (tf && tf !== 'all' && row.typeId !== tf) return false
    if (sf && sf !== 'all' && row.statusId !== sf) return false
    if (vf === 'withvideo' && !row.hasVideo) return false
    if (vf === 'novideo' && row.hasVideo) return false
    if (!search) return true
    return buildHaystack(row).includes(search)
  })
}
