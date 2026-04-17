// teamProfile/modules/players/components/drawer/TeamPlayerPositionsModal.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box, Typography, Chip, Snackbar } from '@mui/joy'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import PlayerPositionFieldPitch from '../../../../../../../../ui/fields/selectUi/players/PlayerPositionsSelect.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { usePlayerHubUpdate } from './../../../../../../hooks/players/usePlayerHubUpdate.js'

import {
  safeArr,
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './teamPlayerQuickEdit.logic.js'

export default function TeamPlayerPositionsDrawer({
  open,
  player,
  onClose,
  onSaved,
}) {
  const [showLimitWarning, setShowLimitWarning] = useState(false)

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
  const headerMeta = 'עריכת עמדות שחקן'

  const status = isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <>
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
            metaIconId="positions"
          />
        }
      >
        <PlayerPositionFieldPitch
          value={draft?.positions}
          onChange={(positions) =>
            setDraft((prev) => ({
              ...prev,
              positions: safeArr(positions),
            }))
          }
          onLimitReached={() => {
            setShowLimitWarning(false)
            setTimeout(() => setShowLimitWarning(true), 10)
          }}
          disabled={pending}
        />

        {!!draft?.positions?.length ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {draft.positions.map((position) => (
              <Chip
                key={position}
                size="sm"
                variant="soft"
                color="primary"
                startDecorator={iconUi({ id: 'positions' })}
              >
                {position}
              </Chip>
            ))}
          </Box>
        ) : (
          <Typography level="body-sm" color="neutral">
            לא נבחרו עמדות
          </Typography>
        )}
      </DrawerShell>

      <Snackbar
        open={showLimitWarning}
        autoHideDuration={2500}
        onClose={() => setShowLimitWarning(false)}
        color="danger"
        size="sm"
        variant="soft"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        ניתן לבחור עד 4 עמדות בלבד
      </Snackbar>
    </>
  )
}
