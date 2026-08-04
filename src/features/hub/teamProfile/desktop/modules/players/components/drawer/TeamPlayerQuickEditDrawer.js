// teamProfile/desktop/modules/players/components/drawer/TeamPlayerQuickEditDrawer.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import PlayerQuickEditFields from '../../../../../../../../ui/forms/players/PlayerQuickEditFields.js'

import { usePlayerHubUpdate } from './../../../../../../hooks/players/usePlayerHubUpdate.js'


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
      <PlayerQuickEditFields
        draft={draft}
        setDraft={setDraft}
        disabled={pending}
        mode="desktop"
      />
    </DrawerShell>
  )
}
