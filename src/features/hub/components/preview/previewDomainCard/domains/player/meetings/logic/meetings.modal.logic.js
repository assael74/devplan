// src/features/players/components/preview/PreviewDomainCard/domains/meetings/logic/meetings.modal.logic.js
import { clean } from '../../../../../../../../../shared/format/string.js'
import { buildNextStatus } from '../../../../../../../../../shared/meetings/meetings.status.js'

export const buildDraftFromMeeting = (m) => {
  return {
    id: m?.id,
    meetingDate: clean(m?.meetingDate || m?.date),
    meetingHour: clean(m?.meetingHour || m?.time),
    meetingFor: clean(m?.meetingFor),
    type: clean(m?.type || m?.typeId),
    status: m?.status, // expected: already normalized shape
    notes: clean(m?.notes),
    videoId: clean(m?.videoId),
  }
}

export const buildSavePayload = ({ draft, editOriginal }) => {
  const nextStatus = buildNextStatus(editOriginal?.status, draft?.status?.current?.id)

  return {
    id: draft?.id,
    patchDate: {
      meetingDate: clean(draft?.meetingDate),
      meetingHour: clean(draft?.meetingHour),
      meetingFor: clean(draft?.meetingFor) || clean(editOriginal?.meetingFor),
    },

    patchPlayer: {
      type: clean(draft?.type),
      status: nextStatus,
    },

    patchNotes: {
      notes: clean(draft?.notes),
    },

    // NOTE: only keep if your router maps videoId; otherwise omit at caller
    patchVideo: {
      videoId: clean(draft?.videoId),
    },
  }
}
