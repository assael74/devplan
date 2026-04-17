// previewDomainCard/domains/club/players/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import playerImage from '../../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { usePlayerHubUpdate } from '../../../../../../../../../hooks/players/usePlayerHubUpdate.js'

import PlayerEditFields from '../../../../../../../../../../../ui/forms/ui/players/PlayerEditFields.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './editDrawer.utils.js'

export default function EditDrawer({
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
      section: 'clubPlayerQuickEdit',
      playerId: initial.id,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || 'שחקן'

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
        reset: 'איפוס טופס',
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
      <PlayerEditFields
        draft={draft}
        setDraft={setDraft}
      />
    </DrawerShell>
  )
}
