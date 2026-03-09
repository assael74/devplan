// src/features/players/components/preview/PreviewDomainCard/domains/meetings/logic/meetings.table.logic.js
import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../../../../shared/meetings/meetings.constants.js'
import { clean } from '../../../../../../../../../shared/format/string.js'
import { getStatusId } from '../../../../../../../../../shared/meetings/meetings.status.js'

export function buildMeetingsTable(meetings, q) {
  const typeMap = new Map(MEETING_TYPES.map((x) => [x.id, x]))
  const statusMap = new Map(MEETING_STATUSES.map((x) => [x.id, x]))

  const search = q?.trim().toLowerCase()

  return (meetings || [])
    .map((m) => {
      const typeId = clean(m?.type || m?.typeId || '')
      const statusId = clean(getStatusId(m?.status) || m?.statusId || m?.status || '')

      const typeMeta = typeMap.get(typeId) || null
      const statusMeta = statusMap.get(statusId) || null
      
      return {
        ...m,
        typeId,
        statusId,
        typeLabel: typeMeta?.labelH || typeId || '—',
        statusLabel: statusMeta?.labelH || statusId || '—',
        typeIcon: typeMeta?.idIcon || null,
        statusIcon: statusMeta?.idIcon || null,
      }
    })
    .filter((m) => {
      if (!search) return true
      return [
        m.meetingDate || m.date,
        m.meetingHour || m.time,
        m.typeLabel,
        m.statusLabel,
        m.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search)
    })
}
