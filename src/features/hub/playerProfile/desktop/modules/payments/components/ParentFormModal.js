// playerProfile/mobile/modules/payments/components/parentDrawer/parentDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Avatar, Box, Typography } from '@mui/joy'

import DrawerShell from '../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import ParentFields from '../../../../../../../ui/forms/parents/ParentFields.js'
import {
  getParentFormLayout,
} from '../../../../../../../ui/forms/parents/form.layout.js'

import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'

import { usePlayerHubUpdate } from '../../../../../hooks/players/usePlayerHubUpdate.js'

import {
  buildParentEditInitial,
  buildParentMeta,
  buildParentsPlayerPatch,
  getIsParentEditValid,
  getParentEditFieldErrors,
  isParentEditDirty,
} from '../../../../../editLogic/payments/index.js'

const noop = () => {}

export default function ParentDrawer({
  open,
  onClose = noop,
  player,
  parent = null,
  onSaved = noop,
}) {
  const initial = useMemo(() => {
    return buildParentEditInitial(parent)
  }, [parent])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const { run, pending } = usePlayerHubUpdate(player)

  const playerId = player?.id || player?.playerId || player?.entityId || player?.docId || ''
  const parents = Array.isArray(player?.parents) ? player.parents : []
  const isEdit = Boolean(parent?.id)
  const layout = getParentFormLayout()

  const fieldErrors = useMemo(() => {
    return getParentEditFieldErrors(draft)
  }, [draft])

  const isValid = useMemo(() => {
    return getIsParentEditValid(draft)
  }, [draft])

  const isDirty = useMemo(() => {
    return isParentEditDirty(draft, initial)
  }, [draft, initial])

  const canSave = isValid && isDirty && !pending

  const title = isEdit ? 'עריכת כרטיס הורה' : 'יצירת כרטיס הורה חדש'
  const saveText = isEdit ? 'שמירת שינויים' : 'יצירת כרטיס הורה'
  const metaText = buildParentMeta(draft, player)

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleSave = useCallback(async () => {
    if (!canSave || !playerId) return

    const patch = buildParentsPlayerPatch({
      player,
      parents,
      draft,
      editingId: parent?.id || '',
    })

    await run(patch, {
      section: 'playerParents',
      id: playerId,
      playerId,
      createIfMissing: true,
    })

    onSaved(patch)
    onClose()
  }, [canSave, playerId, player, parents, draft, parent?.id, run, onSaved, onClose])

  const headerAvatar = (
    <Avatar
      src={player?.photo || playerImage}
      sx={{ width: 38, height: 38 }}
    />
  )

  const headerTitle = player?.playerFullName || player?.name || 'שחקן'

  const status = pending
    ? { text: 'שומר עדכון...', color: 'warning' }
    : !isValid
    ? { text: 'יש להשלים פרטי הורה', color: 'warning' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="player"
      open={!!open}
      onClose={onClose}
      size="md"
      saving={pending}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
      }}
      texts={{
        save: saveText,
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
          title={title}
          avatar={headerAvatar}
          meta={headerTitle}
          subline={metaText}
          metaIconId="payments"
        />
      }
    >
      <Box sx={{ display: 'grid', gap: 1.25, minWidth: 0 }}>
        <ParentFields
          draft={draft}
          onDraft={setDraft}
          layout={layout}
          errors={fieldErrors}
          disabled={pending}
        />

        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          פרטי ההורה נשמרים בתוך כרטיס השחקן ומשמשים באזור התשלומים.
        </Typography>
      </Box>
    </DrawerShell>
  )
}
