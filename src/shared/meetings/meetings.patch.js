// src/shared/meetings/meetings.patch.js
import { buildNextStatus, getStatusId } from './meetings.status.js'

export function buildMeetingPatch({ draft, original }) {
  if (!draft?.id) return null
  const patch = {}

  if (draft.meetingDate !== (original?.meetingDate || '')) patch.meetingDate = draft.meetingDate
  if (draft.meetingHour !== (original?.meetingHour || '')) patch.meetingHour = draft.meetingHour
  if (draft.type !== (original?.type || '')) patch.type = draft.type

  // ✅ status: רק אם השתנה
  const prevStatusId = getStatusId(original?.status)
  const nextStatusId = draft?.status?.current?.id || ''
  if (nextStatusId !== prevStatusId) {
    patch.status = buildNextStatus(original?.status, nextStatusId)
  }

  if ((draft.notes || '') !== (original?.notes || '')) patch.notes = draft.notes || ''
  if (JSON.stringify(draft.tags || []) !== JSON.stringify(original?.tags || [])) patch.tags = draft.tags || []

  // ⚠️ כרגע אל תכניס videoId/title ל-patch אם הם לא נשמרים ב-router
  // (אחרת גם זה ידליק isDirty לשווא)

  return patch
}
