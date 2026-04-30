// teamProfile/mobile/modules/players/components/drawer/TeamPlayerQuickEditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box, Typography } from '@mui/joy'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { usePlayerHubUpdate } from './../../../../../../hooks/players/usePlayerHubUpdate.js'
import { useLifecycle } from '../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'
import {
  PlayerIfaLinkField,
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
  DateInputField,
} from '../../../../../../../../ui/fields'
import ProjectStatusSelectField from '../../../../../../../../ui/fields/selectUi/players/ProjectStatusSelectField.js'
import PlayerActiveSelector from '../../../../../../../../ui/fields/checkUi/players/PlayerActiveSelector.js'
import SquadRoleSelectField from '../../../../../../../../ui/fields/selectUi/players/SquadRoleSelectField.js'
import PlayerTypeSelector from '../../../../../../../../ui/fields/checkUi/players/PlayerTypeSelector.js'

import {
  buildPlayerEditInitial,
  buildPlayerEditPatch,
  isPlayerEditDirty,
} from '../../../../../../editLogic/players/index.js'

export default function TeamPlayerQuickEditDrawer({
  open,
  player,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildPlayerEditInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const lifecycle = useLifecycle()

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isDirty = useMemo(() => isPlayerEditDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPlayerEditPatch(draft, initial), [draft, initial])

  const { run, pending } = usePlayerHubUpdate(player)
  const canSave = !!initial?.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run(patch, {
      section: 'teamPlayerQuickEdit',
      playerId: initial.id,
      createIfMissing: true
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

  const handleDelete = useCallback(() => {
    if (!player?.id) return

    lifecycle.openLifecycle(
      {
        entityType: 'player',
        id: player.id,
        name: `${player?.playerFullName}`,
      },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'player') return
          if (id !== player?.id) return

          onClose()
        },
      }
    )
  }, [lifecycle, player?.id, player?.playerFullName, onClose])

  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || initial?.name || 'שחקן'
  const headerMeta = 'עריכת פרטי שחקן'

  const status = isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="player"
      size='lg'
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
        delete: 'מחיקת שחקן',
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
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', alignItems: 'center', gap: 2, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

        <PlayerTypeSelector
          size="md"
          value={draft?.type === 'project'}
          onChange={(next) =>
            setDraft((prev) => ({
              ...prev,
              type: next ? 'project' : 'noneType',
            }))
          }
        />
      </Box>

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

      <PlayerShortNameField
        size="sm"
        value={draft?.playerShortName || ''}
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            playerShortName: value,
          }))
        }
      />

      <DateInputField
        value={draft?.birthDay || ''}
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            birthDay: value,
          }))
        }
        label="יום הולדת"
        size="sm"
      />

      <PlayerIfaLinkField
        size="sm"
        value={draft?.ifaLink || ''}
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            ifaLink: value,
          }))
        }
      />
    </Box>
    </DrawerShell>
  )
}
