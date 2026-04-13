// hub/components/preview/views/components/teamDrawer/TeamEditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import DrawerShell from '../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useTeamHubUpdate } from '../../../../../hooks/teams/useTeamHubUpdate.js'

import TeamEditFields from '../../../../../../../ui/forms/ui/teams/TeamEditFields.js'

import {
  buildTeamEditInitial,
  buildTeamEditPatch,
  getTeamEditFieldErrors,
  getIsTeamEditValid,
  isTeamEditDirty,
} from './teamEditDrawer.utils.js'

export default function TeamEditDrawer({
  open,
  team,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildTeamEditInitial(team), [team])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const fieldErrors = useMemo(() => getTeamEditFieldErrors(draft), [draft])
  const isValid = useMemo(() => getIsTeamEditValid(draft), [draft])
  const isDirty = useMemo(() => isTeamEditDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildTeamEditPatch(draft, initial), [draft, initial])

  const { run, pending } = useTeamHubUpdate(team)
  const canSave = !!team?.id && isDirty && isValid && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('updateTeam', patch, {
      section: 'teamQuickEdit',
      teamId: team?.id,
      createIfMissing: true,
    })

    onSaved?.(patch, { ...team, ...patch })
    onClose?.()
  }, [canSave, run, patch, team, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const status = !isValid
    ? { text: 'יש להשלים שם קבוצה', color: 'warning' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="team"
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
          entity="team"
          title={draft?.teamName || team?.teamName || 'קבוצה'}
          subline={
            [
              draft?.league || team?.league || '',
              draft?.teamYear || team?.teamYear || '',
            ]
              .filter(Boolean)
              .join(' · ') || 'פרטי קבוצה'
          }
          titleIconId="teams"
          context={context}
        />
      }
    >
      <TeamEditFields
        draft={draft}
        setDraft={setDraft}
      />
    </DrawerShell>
  )
}
