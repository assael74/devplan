// previewDomainCard/domains/club/teams/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { resolveEntityAvatar } from '../../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { useLifecycle } from '../../../../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import TeamEditFields from '../../../../../../../../../../../ui/forms/ui/teams/TeamEditFields.js'

import { useTeamHubUpdate } from '../../../../../../../../../hooks/teams/useTeamHubUpdate.js'

import {
  buildTeamEditInitial,
  buildTeamEditPatch,
  isTeamEditDirty,
} from './editDrawer.utils.js'

export default function EditDrawer({
  open,
  team,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildTeamEditInitial(team), [team])
  const [draft, setDraft] = useState(initial)
  const lifecycle = useLifecycle()

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isValid = useMemo(() => {
    return !!String(draft?.teamName || '').trim() && !!String(draft?.teamYear || '').trim()
  }, [draft])

  const isDirty = useMemo(() => isTeamEditDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildTeamEditPatch(draft, initial), [draft, initial])

  const { run, pending } = useTeamHubUpdate(team)
  const canSave = !!initial?.id && isDirty && isValid && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('teamQuickEdit', patch, {
      section: 'teamQuickEdit',
      teamId: initial.id,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }, [canSave, run, patch, initial.id, initial.raw, onSaved, onClose])

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

          onClose()
        },
      }
    )
  }, [lifecycle, team?.id, team?.teamName, onClose])

  const teamEntity = context?.team || team || null

  const headerAvatar = resolveEntityAvatar({
    entityType: 'team',
    entity: teamEntity,
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
        delete: 'מחיקת משחק',
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
