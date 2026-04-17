// teamProfile/modules/players/components/drawer/TeamPlayerQuickEditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { usePlayerHubUpdate } from './../../../../../../hooks/players/usePlayerHubUpdate.js'
import ProjectStatusSelectField from '../../../../../../../../ui/fields/selectUi/players/ProjectStatusSelectField.js'
import PlayerActiveSelector from '../../../../../../../../ui/fields/checkUi/players/PlayerActiveSelector.js'
import SquadRoleSelectField from '../../../../../../../../ui/fields/selectUi/players/SquadRoleSelectField.js'
import PlayerTypeSelector from '../../../../../../../../ui/fields/checkUi/players/PlayerTypeSelector.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './teamPlayerQuickEdit.logic.js'

export default function TeamPlayerQuickEditDrawer({
  open,
  player,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildInitialDraft(player), [player])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = usePlayerHubUpdate(player)
  const canSave = !!initial?.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run(patch, {
      section: 'teamPlayerQuickEdit',
      playerId: initial.id,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft({
      ...initial,
      positions: [...initial.positions],
    })
  }, [initial, pending])

  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || initial?.name || 'שחקן'
  const headerMeta = 'עריכת פרטי שחקן'

  const status = isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="player"
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
          entity="player"
          title={headerTitle}
          avatar={headerAvatar}
          meta={headerMeta}
          metaIconId="info"
        />
      }
    >
      <PlayerActiveSelector
        size="md"
        value={draft?.active}
        onChange={() =>
          setDraft((prev) => ({
            ...prev,
            active: !prev.active,
          }))
        }
      />

      <SquadRoleSelectField
        size="md"
        value={draft?.squadRole}
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            squadRole: value,
          }))
        }
      />

      <PlayerTypeSelector
        size="md"
        value={draft?.type}
        onChange={(next) =>
          setDraft((prev) => ({
            ...prev,
            type: next || 'noneType',
          }))
        }
      />

      <ProjectStatusSelectField
        label="סטטוס פרויקט"
        size="sm"
        value={draft?.projectStatus}
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            projectStatus: value,
          }))
        }
        disabled={pending}
      />
    </DrawerShell>
  )
}
