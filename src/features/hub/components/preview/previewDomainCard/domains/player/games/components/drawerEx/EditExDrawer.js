// previewDomainCard/domains/player/games/components/drawerEx/EditExDrawer.js

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

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { useGameHubUpdate } from '../../../../../../../../hooks/games/useGameHubUpdate.js'

import EditExDrawerHeader from './EditExDrawerHeader.js'
import EditExDrawerFields from './EditExDrawerFields.js'

import {
  buildInitialExDraft,
  getIsExDirty,
  getExValidity,
  buildUpdateExternalGamePatch,
} from './editExDrawer.utils.js'

import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditExDrawer({ open, game, onClose, onSaved, context }) {
  const player = context?.player || {}
  const initial = useMemo(() => buildInitialExDraft(game, context), [game, context])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const activeGame = game || null
  const { run, pending } = useGameHubUpdate(activeGame)

  const validity = useMemo(() => getExValidity(draft), [draft])
  const isDirty = useMemo(() => getIsExDirty(draft, initial), [draft, initial])
  const canSave = !!draft?.gameId && isDirty && validity?.ok && !pending

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setDraft(initial)
  }

  const handleSave = async () => {
    if (!canSave) return

    const patch = buildUpdateExternalGamePatch({ game: activeGame, draft })

    await run('updateExternalGame', patch, {
      gameId: activeGame?.id,
      routerEntityType: 'externalGames',
      gameSource: 'external',
      isExternalGame: true,
      game: activeGame,
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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <EditExDrawerHeader game={game} player={player} />
          <ModalClose sx={{ mt: 2, mr: 2 }} />

          <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, p: 1.25, pt: 1, overflow: 'auto', minHeight: 0 }}>
            <EditExDrawerFields
              draft={draft}
              setField={setField}
              player={player}
              context={context}
              validity={validity}
              pending={pending}
            />
          </Box>

          <Box sx={sx.footerSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                loading={pending}
                disabled={!canSave}
                startDecorator={!pending ? iconUi({ id: 'save' }) : null}
                onClick={handleSave}
                sx={sx.conBut('private')}
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
            </Box>

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
              {!isDirty
                ? 'אין שינויים'
                : !validity?.ok
                  ? validity.message || 'יש להשלים נתונים תקינים'
                  : 'יש שינויים שלא נשמרו'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
