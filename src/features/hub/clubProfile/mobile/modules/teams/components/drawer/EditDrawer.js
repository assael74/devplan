// clubProfile/desktop/modules/teams/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import TeamEditFields from '../../../../../../../../ui/forms/ui/teams/TeamEditFields.js'

import { useTeamHubUpdate } from '../../../../../../hooks/teams/useTeamHubUpdate.js'
import { useLifecycle } from '../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import {
  buildTeamEditInitial,
  buildTeamEditPatch,
  isTeamEditDirty,
  getIsTeamEditValid,
} from '../../../../../../editLogic/teams/index.js'

export default function EditDrawer({
  open,
  team,
  context,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildTeamEditInitial(team), [team])
  const [draft, setDraft] = useState(initial)
  const lifecycle = useLifecycle()

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isValid = useMemo(() => getIsTeamEditValid(draft), [draft])

  const isDirty = useMemo(() => isTeamEditDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildTeamEditPatch(draft, initial), [draft, initial])

  const { run, pending } = useTeamHubUpdate(team)
  const canSave = !!initial?.id && isDirty && isValid && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('clubTeamEdit', patch, {
      section: 'clubTeamEdit',
      teamId: initial.id,
      createIfMissing: true
    })

    onSaved(patch, { ...team, ...patch })
    onClose()
  }, [canSave, run, patch, initial.id, team, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft({ ...initial })
  }, [initial, pending])

  const handleDelete = useCallback(() => {
    if (!team?.id) return

    lifecycle.openLifecycle(
      {
        entityType: 'team',
        id: team.id,
        name: `${team?.teamName || 'קבוצה'}`,
      },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'team') return
          if (id !== team.id) return

          onClose?.()
        },
      }
    )
  }, [lifecycle, team?.id, team?.teamName, onClose])

  const headerAvatar = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: context?.club,
    subline: context?.club?.clubName || context?.club?.name || '',
  })

  const headerTitle = draft?.teamName || team?.teamName || 'קבוצה'
  const headerMeta = `${context?.club?.clubName || context?.club?.name || 'מועדון'} | ${
    draft?.teamYear || team?.teamYear || ''
  }`

  const status = !isValid
    ? { text: 'יש שדות חובה חסרים', color: 'warning' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="team"
      open={open}
      size='lg'
      anchor='bottom'
      onClose={onClose}
      saving={pending}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
        onDelete: handleDelete,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס השינויים',
        delete: 'מחיקת קבוצה',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="team"
          title={headerTitle}
          avatar={headerAvatar}
          meta={headerMeta}
          metaIconId="teams"
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
