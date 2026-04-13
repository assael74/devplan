// hub/components/preview/views/components/clubDrawer/ClubEditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import DrawerShell from '../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import ClubEditFields from '../../../../../../../ui/forms/ui/clubs/ClubEditFields.js'

import { useClubHubUpdate } from '../../../../../hooks/clubs/useClubHubUpdate.js'

import {
  buildClubEditInitial,
  buildClubEditPatch,
  getClubEditFieldErrors,
  getIsClubEditValid,
  isClubEditDirty,
} from './clubEditDrawer.utils.js'

export default function ClubEditDrawer({
  open,
  club,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildClubEditInitial(club), [club])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const fieldErrors = useMemo(() => getClubEditFieldErrors(draft), [draft])
  const isValid = useMemo(() => getIsClubEditValid(draft), [draft])
  const isDirty = useMemo(() => isClubEditDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildClubEditPatch(draft, initial), [draft, initial])

  const { run, pending } = useClubHubUpdate(club)
  const canSave = !!club?.id && isDirty && isValid && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('updateClub', patch, {
      section: 'clubQuickEdit',
      clubId: club?.id,
      createIfMissing: true,
    })

    onSaved?.(patch, { ...club, ...patch })
    onClose?.()
  }, [canSave, run, patch, club, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const status = !isValid
    ? { text: 'יש להשלים שם מועדון', color: 'warning' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="club"
      open={open}
      onClose={onClose}
      saving={pending}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס השינויים',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="club"
          title={draft?.clubName || club?.clubName || 'מועדון'}
          subline={draft?.ifaLink || 'פרטי מועדון'}
          titleIconId="clubs"
        />
      }
    >
      <ClubEditFields
        draft={draft}
        onDraft={setDraft}
        fieldErrors={fieldErrors}
      />
    </DrawerShell>
  )
}
