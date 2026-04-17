// playerProfile/sharedLogic/meetings/module/meetings.buckets.js

import { getStatusId } from '../../../../../../shared/meetings/meetings.status.js'

function toMs(m) {
  if (Number.isFinite(m?._ms) && m._ms > 0) return m._ms
  if (Number.isFinite(m?.ms) && m.ms > 0) return m.ms
  return 0
}

export function buildMeetingsBucketsLimited(list, { upcomingLimit = 2 } = {}) {
  const arr = Array.isArray(list) ? list.filter(Boolean) : []

  const done = []
  const canceled = []
  const active = []

  for (const m of arr) {
    const sid = getStatusId(m?.status) || m?.statusId || ''
    if (sid === 'done') done.push(m)
    else if (sid === 'canceled') canceled.push(m)
    else active.push(m)
  }

  active.sort((a, b) => toMs(a) - toMs(b))

  const next = active[0] || null
  const upcoming = active.slice(1, 1 + upcomingLimit)

  done.sort((a, b) => toMs(b) - toMs(a))
  canceled.sort((a, b) => toMs(b) - toMs(a))

  return { next, upcoming, done, canceled }
}
