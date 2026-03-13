// previewDomainCard/domains/player/games/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip, ModalClose } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { useGameHubUpdate } from '../../../../../../../../hooks/useGameHubUpdate.js'

import EditDrawerHeader from './EditDrawerHeader.js'
import EditDrawerFields from './EditDrawerFields.js'

import {
  buildInitialDraft,
  buildUpdateGamePlayersPatch,
  buildRemovePlayerFromGamePatch,
  getIsDirty,
} from './editDrawer.utils.js'

import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawer({ open, game, onClose, onSaved, context }) {
  const initial = useMemo(() => buildInitialDraft(game), [game])
  const [draft, setDraft] = useState(initial)
  
  const player = context?.player || {}

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const activeGame = game|| null
  const { run, pending } = useGameHubUpdate(activeGame)

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const canSave = !!draft?.gameId && !!draft?.playerId && isDirty && !pending

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => setDraft(initial)

  const handleSave = async () => {
    if (!canSave) return

    const patch = buildUpdateGamePlayersPatch({
      game: activeGame,
      draft,
    })

    await run('updateGamePlayers', patch, {
      gameId: activeGame?.id,
      createIfMissing: true,
    })

    onSaved(patch)
    onClose()
  }

  const handleRemoveFromGame = async () => {
    const patch = buildRemovePlayerFromGamePatch({
      game: activeGame,
      playerId: draft?.playerId,
    })

    await run('removePlayerFromGame', patch, {
      gameId: activeGame?.id,
      createIfMissing: false,
    })

    onSaved(patch)
    onClose()
  }

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={pending ? undefined : onClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { xs: 0, md: 2 },
            boxShadow: 'none',
          },
        },
      }}
    >
      <Sheet sx={sx.drawerSheetSx}>
        <Box sx={sx.drawerRootSx}>
          <EditDrawerHeader game={game} player={player} />
          <ModalClose sx={{ mt: 2, mr: 2 }} />

          <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, p: 1.25, pt: 1, overflow: 'auto' }}>
            <EditDrawerFields
              draft={draft}
              setField={setField}
              player={player}
              pending={pending}
            />
          </Box>

          <Box sx={sx.footerSx}>
            <Box sx={sx.footerActionsSx}>
              <Button
                loading={pending}
                disabled={!canSave}
                startDecorator={!pending ? iconUi({ id: 'save' }) : null}
                onClick={handleSave}
                sx={sx.conBut}
              >
                שמירה
              </Button>

              <Button
                color="neutral"
                variant="outlined"
                onClick={onClose}
                disabled={pending}
              >
                ביטול
              </Button>

              <Tooltip title="איפוס השינויים">
                <span>
                  <IconButton
                    disabled={!isDirty || pending}
                    size="sm"
                    variant="soft"
                    sx={sx.icoRes}
                    onClick={handleReset}
                  >
                    {iconUi({ id: 'reset' })}
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="הסרת השחקן מהמשחק">
                <span>
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="solid"
                    onClick={handleRemoveFromGame}
                    disabled={pending}
                  >
                    {iconUi({ id: 'delete' })}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
              {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
