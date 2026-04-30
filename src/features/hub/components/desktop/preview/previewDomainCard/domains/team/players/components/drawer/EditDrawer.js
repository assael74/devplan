// previewDomainCard/domains/team/players/components/drawer/TeamPlayerEditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box, Typography, Snackbar } from '@mui/joy'

import playerImage from '../../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import PlayerPositionFieldPitch from '../../../../../../../../../../../ui/fields/selectUi/players/PlayerPositionsSelect.js'
import PlayerEditFields from '../../../../../../../../../../../ui/forms/ui/players/PlayerEditFields.js'

import { usePlayerHubUpdate } from '../../../../../../../../../hooks/players/usePlayerHubUpdate.js'

import {
  safeArr,
  buildPlayerEditInitial,
  buildPlayerEditPatch,
  isPlayerEditDirty,
} from '../../../../../../../../../editLogic/players/index.js'

export default function EditDrawer({
  open,
  player,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildPlayerEditInitial(player), [player])
  const [draft, setDraft] = useState(initial)
  const [showLimitWarning, setShowLimitWarning] = useState(false)

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

  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || initial?.name || 'שחקן'
  const headerMeta = initial?.teamName || 'שחקן קבוצה'

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
          reset: 'איפוס טופס',
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
        <Box
          sx={{
            display: 'grid',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              p: 1,
              borderRadius: 'md',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.surface',
            }}
          >
            <Typography level="body-sm" sx={{ fontWeight: 700 }}>
              עמדות
            </Typography>

            <PlayerPositionFieldPitch
              size="sm"
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
          </Box>

          <PlayerEditFields
            draft={draft}
            setDraft={setDraft}
          />
        </Box>
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
