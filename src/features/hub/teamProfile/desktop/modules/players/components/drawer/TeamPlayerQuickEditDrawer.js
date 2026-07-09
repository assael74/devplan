// teamProfile/desktop/modules/players/components/drawer/TeamPlayerQuickEditDrawer.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Box } from '@mui/joy'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { usePlayerHubUpdate } from './../../../../../../hooks/players/usePlayerHubUpdate.js'

import PlayerActiveSelector from '../../../../../../../../ui/fields/checkUi/players/PlayerActiveSelector.js'
import PlayerTypeSelector from '../../../../../../../../ui/fields/checkUi/players/PlayerTypeSelector.js'
import ProjectStatusSelectField from '../../../../../../../../ui/fields/selectUi/players/ProjectStatusSelectField.js'
import SeasonPlanStatusSelect from '../../../../../../../../ui/fields/selectUi/players/SeasonPlanStatusSelect.js'
import SquadRoleSelectField from '../../../../../../../../ui/fields/selectUi/players/SquadRoleSelectField.js'

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
  const initial = useMemo(() => {
    return buildPlayerEditInitial(player)
  }, [player])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return

    setDraft(initial)
  }, [open, initial])

  const isDirty = useMemo(() => {
    return isPlayerEditDirty(draft, initial)
  }, [draft, initial])

  const patch = useMemo(() => {
    return buildPlayerEditPatch(draft, initial)
  }, [draft, initial])

  const { run, pending } = usePlayerHubUpdate(player)
  const canSave = Boolean(initial?.id) && isDirty && !pending

  const updateDraft = useCallback((key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const handleSave = async () => {
    if (!canSave) return

    await run(patch, {
      section: 'teamPlayerQuickEdit',
      playerId: initial.id,
      createIfMissing: true,
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
        onChange={() => updateDraft('active', !draft?.active)}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(0, 1.25fr) minmax(0, 1fr)',
          },
          gap: 1.25,
          alignItems: 'flex-end',
        }}
      >
        <SeasonPlanStatusSelect
          size="md"
          value={draft?.seasonPlanStatus}
          onChange={(value) => updateDraft('seasonPlanStatus', value)}
          disabled={pending}
          emptyLabel="ללא תוכנית"
        />

        <SquadRoleSelectField
          size="md"
          label="מעמד"
          value={draft?.squadRole}
          onChange={(value) => updateDraft('squadRole', value)}
          disabled={pending}
          emptyLabel="ללא מעמד"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(120px, 0.7fr) minmax(0, 1.5fr)',
          },
          gap: 1.25,
          alignItems: 'flex-end',
        }}
      >
        <PlayerTypeSelector
          size="md"
          value={draft?.type}
          onChange={(value) => updateDraft('type', value)}
          disabled={pending}
        />

        <ProjectStatusSelectField
          label="סטטוס פרויקט"
          size="md"
          value={draft?.projectStatus}
          onChange={(value) => updateDraft('projectStatus', value)}
          disabled={pending}
          emptyLabel="ללא סטטוס פרויקט"
        />
      </Box>
    </DrawerShell>
  )
}
