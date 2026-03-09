const sid = (v) => (v == null ? '' : String(v))
const asArr = (v) => (Array.isArray(v) ? v : [])

function buildTagsFull(video, context) {
  const tagIds = Array.isArray(video?.tagIds)
    ? video.tagIds
    : Array.isArray(video?.tags)
    ? video.tags
    : []

  if (!tagIds.length) return []

  const tagsMap =
    context?.tagsById ||
    (Array.isArray(context?.tags)
      ? Object.fromEntries(context.tags.map((t) => [String(t.id), t]))
      : null)

  if (!tagsMap) return []

  return tagIds
    .map((id) => tagsMap[String(id)] || null)
    .filter(Boolean)
}

export function enrichVideoAnalysisForPlayer(video, player, context = {}) {
  if (!video) return null

  const tagsFull = buildTagsFull(video, context)

  const base = {
    ...video,
    player,
    tagsFull,
  }

  if (sid(video?.contextType) !== 'meeting') return base

  const meetingId = sid(video?.meetingId)
  const meetings = asArr(player?.meetings)

  const meeting =
    meetings.find((m) => sid(m?.id) === meetingId) ||
    meetings.find((m) => sid(m?.meetingId) === meetingId) ||
    null

  return {
    ...base,
    meeting,
    owner: meeting
      ? { type: 'meeting', id: meetingId, name: meeting?.title || meeting?.meetingName || 'פגישה' }
      : { type: 'meeting', id: meetingId, name: 'פגישה' },
  }
}

export function enrichVideoAnalysisForTeam(video, team, context = {}) {
  if (!video) return null

  const tagsFull = buildTagsFull(video, context)

  const base = {
    ...video,
    team,
    tagsFull,
  }

  if (sid(video?.contextType) !== 'meeting') return base

  const meetingId = sid(video?.meetingId)
  const meetings = asArr(team?.meetings)

  const meeting =
    meetings.find((m) => sid(m?.id) === meetingId) ||
    meetings.find((m) => sid(m?.meetingId) === meetingId) ||
    null

  return {
    ...base,
    meeting,
    owner: meeting
      ? { type: 'meeting', id: meetingId, name: meeting?.title || meeting?.meetingName || 'פגישה' }
      : { type: 'meeting', id: meetingId, name: 'פגישה' },
  }
}
