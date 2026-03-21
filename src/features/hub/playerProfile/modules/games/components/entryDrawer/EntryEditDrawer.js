// playerProfile/modules/games/components/entryDrawer/EntryEditDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Drawer,
  Sheet,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  ModalClose,
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { useGameHubUpdate } from '../../../../../hooks/games/useGameHubUpdate.js'

import EntryEditHeaderDrawer from './EntryEditHeaderDrawer.js'
import EntryEditContentDrawer from './EntryEditContentDrawer.js'

import {
  buildInitialDraft,
  buildUpdateGamePlayersPatch,
  buildRemovePlayerFromGamePatch,
  getIsDirty,
} from './logic/entryEditDrawer.utils.js'

import { entryEditDrawerSx as sx } from './sx/entryEditDrawer.sx.js'

export default function EntryEditDrawer({
  open,
  game,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || {}
  const initial = useMemo(() => buildInitialDraft(game, player), [game, player])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const activeGame = game || null
  const { run, pending } = useGameHubUpdate(activeGame)

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const canSave = !!draft?.gameId && !!draft?.playerId && isDirty && !pending

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setDraft(initial)
  }

  const handleSave = async () => {
    if (!canSave) return

    const patch = buildUpdateGamePlayersPatch({
      game: activeGame,
      draft,
    })

    await run('updateGamePlayer', patch, {
      gameId: activeGame?.id,
      createIfMissing: true,
    })

    onSaved(patch)
    onClose()
  }

  const handleRemoveFromGame = async () => {
    if (!draft?.playerId || !activeGame?.id) return

    const patch = buildRemovePlayerFromGamePatch({
      game: activeGame,
      playerId: draft.playerId,
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
      slotProps={{ content: { sx: sx.drawerSx, }, }}
    >
      <Sheet sx={sx.drawerSheet}>
        <Box sx={sx.drawerRootSx}>
          <EntryEditHeaderDrawer game={game} player={player} />

          <Box className="dpScrollThin" sx={sx.content}>
            <EntryEditContentDrawer
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
