import { useMemo, useState } from 'react'
import { buildDraftFromMeeting } from '../logic/meetings.modal.logic.js'
import { clean } from '../../../../../../../../../shared/format/string.js'

function isDirtyDraft(draft, original) {
  if (!draft || !original) return false

  const normalize = (obj) =>
    JSON.stringify({
      meetingDate: clean(obj.meetingDate),
      meetingHour: clean(obj.meetingHour),
      type: clean(obj.type || obj.typeId),
      statusId: clean(obj.status?.current?.id),
      notes: clean(obj.notes),
      videoId: clean(obj.videoId),
    })

  return normalize(draft) !== normalize(original)
}

export function useMeetingsState() {
  const [draft, setDraft] = useState(null)
  const [editOriginal, setEditOriginal] = useState(null)

  const [basicOpen, setBasicOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)

  const openDrawer = (type, meeting) => {
    setEditOriginal(meeting)
    setDraft(buildDraftFromMeeting(meeting))

    if (type === 'basic') setBasicOpen(true)
    if (type === 'notes') setNotesOpen(true)
    if (type === 'video') setVideoOpen(true)
  }

  const closeAll = () => {
    setBasicOpen(false)
    setNotesOpen(false)
    setVideoOpen(false)
    setDraft(null)
    setEditOriginal(null)
  }

  const dirty = useMemo(
    () => isDirtyDraft(draft, editOriginal),
    [draft, editOriginal]
  )

  return {
    draft,
    setDraft,
    editOriginal,
    basicOpen,
    notesOpen,
    videoOpen,
    openDrawer,
    closeAll,
    dirty,
  }
}
