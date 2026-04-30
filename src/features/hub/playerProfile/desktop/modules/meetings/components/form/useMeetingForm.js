// playerProfile/desktop/modules/meetings/components/form/useMeetingForm.js

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMeetingHubUpdate } from '../../../../../../hooks/meetings/useMeetingHubUpdate.js'

import {
  buildMeetingEditInitial,
  buildMeetingEditBundle,
  isMeetingEditDirty,
  getIsMeetingEditValid,
} from '../../../../../../editLogic/mettings/index.js'

export default function useMeetingForm(selected) {
  const [isEditing, setIsEditing] = useState(false)

  const initial = useMemo(() => {
    return buildMeetingEditInitial(selected)
  }, [selected])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    setIsEditing(false)
    setDraft(initial)
  }, [initial])

  const bundle = useMemo(() => {
    return buildMeetingEditBundle(draft, initial)
  }, [draft, initial])

  const patch = bundle?.meetingPatch || {}

  const isDirty = useMemo(() => {
    return isMeetingEditDirty(draft, initial)
  }, [draft, initial])

  const isValid = useMemo(() => {
    return getIsMeetingEditValid(draft)
  }, [draft])

  const meetingUpdate = useMeetingHubUpdate(selected)
  const pending = meetingUpdate.pending

  const canSave = Boolean(draft?.id) && isDirty && isValid && !pending

  const startEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
    setDraft(initial)
  }, [initial])

  const resetEdit = useCallback(() => {
    setDraft(initial)
  }, [initial])

  const save = useCallback(async () => {
    if (!canSave) return
    if (!Object.keys(patch).length) return

    await meetingUpdate.run('updateMeeting', patch, {
      section: 'playerProfile.meetings',
      meetingId: draft.id,
      createIfMissing: true,
    })

    setIsEditing(false)
  }, [canSave, meetingUpdate, patch, draft?.id])

  return {
    initial,
    draft,
    setDraft,
    patch,
    bundle,
    isDirty,
    isValid,
    canSave,
    isEditing,
    pending,
    startEdit,
    cancelEdit,
    resetEdit,
    save,
  }
}
