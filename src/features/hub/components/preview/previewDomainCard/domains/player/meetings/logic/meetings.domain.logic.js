// src/features/players/components/preview/PreviewDomainCard/domains/meetings/logic/meetings.domain.logic.js
import { DOMAIN_STATE } from '../../../../../preview.state'
import { MEETING_STATUSES } from '../../../../../../../../../shared/meetings/meetings.constants.js'
import { getStatusId } from '../../../../../../../../../shared/meetings/meetings.status.js'

const getStatusMeta = (status) => {
  const id = getStatusId(status)
  const meta = MEETING_STATUSES.find((x) => x.id === id) || null
  return {
    id,
    labelH: meta?.labelH || '',
    idIcon: meta?.idIcon || 'meetings',
  }
}

export const resolveMeetingsDomain = (player) => {
  const items = Array.isArray(player?.meetings) ? player.meetings : []
  const count = items.length

  let state = DOMAIN_STATE.EMPTY
  if (count === 0) state = DOMAIN_STATE.EMPTY
  else if (items.some((m) => !m?.meetingDate && !m?.date)) state = DOMAIN_STATE.PARTIAL
  else state = DOMAIN_STATE.OK

  return { count, state, items }
}

const pad2 = (n) => String(n).padStart(2, '0')

const formatDateIL = (msOrDate) => {
  if (!msOrDate) return '—'
  const d = msOrDate instanceof Date ? msOrDate : new Date(msOrDate)
  if (Number.isNaN(d.getTime())) return '—'
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
}

const toMsAny = (m) => {
  // prefer normalized _ms if exists
  const ms = Number(m?._ms || 0)
  if (Number.isFinite(ms) && ms > 0) return ms

  const dateStr = m?.meetingDate || m?.date
  if (!dateStr) return 0
  const d = new Date(dateStr) // fallback (date only)
  return Number.isNaN(d.getTime()) ? 0 : d.getTime()
}

export const buildMeetingsCardKpis = (meetings = []) => {
  const nowMs = Date.now()

  const items = (meetings || [])
    .map((m) => ({ ...m, _ms2: toMsAny(m) }))
    .filter((m) => m._ms2)

  const past = items.filter((m) => m._ms2 <= nowMs).sort((a, b) => b._ms2 - a._ms2)
  const future = items.filter((m) => m._ms2 > nowMs).sort((a, b) => a._ms2 - b._ms2)

  const last = past[0] || null
  const next = future[0] || null

  const lastMeta = getStatusMeta(last?.status)
  const nextMeta = getStatusMeta(next?.status)

  return {
    count: (meetings || []).length,

    lastLabel: last
      ? `${formatDateIL(last._ms2)}${lastMeta.labelH ? ` • ${lastMeta.labelH}` : ''}`
      : '—',

    nextLabel: next
      ? `${formatDateIL(next._ms2)}${nextMeta.labelH ? ` • ${nextMeta.labelH}` : ''}`
      : 'אין',

    hasNext: !!next,
    lastIcon: lastMeta.idIcon || 'meetings',
    nextIcon: nextMeta.idIcon || 'meetings',
  }
}
