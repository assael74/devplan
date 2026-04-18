// playerProfile/desktop/modules/meetings/components/form/useMeetingForm.js

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMeetingHubUpdate } from '../../../../../../hooks/meetings/useMeetingHubUpdate.js'
import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from '../../../../../sharedLogic/meetings/module/meetingEdit.logic.js'

export default function useMeetingForm(selected) {
  const [isEditing, setIsEditing] = useState(false)

  const initial = useMemo(() => buildInitialDraft(selected), [selected])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    setIsEditing(false)
    setDraft(initial)
  }, [initial])

  const patch = useMemo(() => buildPatch(selected, draft), [selected, draft])
  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])

  const meetingUpdate = useMeetingHubUpdate(selected)
  const pending = meetingUpdate.pending

  const canSave = Boolean(draft?.id) && isDirty && !pending

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
    if (!draft?.id) return
    if (!patch || !Object.keys(patch).length) return

    await meetingUpdate.run('update', patch, {
      section: 'playerProfile.meetings',
      meetingId: draft.id,
      createIfMissing: false,
    })

    setIsEditing(false)
  }, [draft?.id, patch, meetingUpdate])

  return {
    initial,
    draft,
    setDraft,
    patch,
    isDirty,
    canSave,
    isEditing,
    pending,
    startEdit,
    cancelEdit,
    resetEdit,
    save,
  }
}
