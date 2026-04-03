// previewDomainCard/domains/player/games/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Drawer,
  ModalClose,
  Sheet,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from '@mui/joy'
import { useGameHubUpdate } from '../../../../../../../../hooks/games/useGameHubUpdate.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import NewFormDrawerHeader from './NewFormDrawerHeader.js'
import NewFormFieldsDrawer from './NewFormFieldsDrawer.js'

import {
  buildInitialDraft,
  getIsDirty,
  getIsValid,
  buildPlayerListPatch,
} from './newFormDrawer.utils.js'

import { drawerNewFormSx as sx } from '../../sx/newFormDrawer.sx.js'

export default function NewFormDrawer({ open, onClose, onSaved, context }) {
  const player = context?.player || context?.entity || null

  const initial = useMemo(() => buildInitialDraft(context), [context])
  const [draft, setDraft] = useState(initial)
  const [pending, setPending] = useState(false)

  const activeGame = useMemo(() => {
    const games = Array.isArray(player?.teamGames) ? player.teamGames : []
    return games.find((g) => String(g?.id) === String(draft?.gameId)) || null
  }, [player?.teamGames, draft?.gameId])

  const { run } = useGameHubUpdate(activeGame)

  useEffect(() => {
    if (!open) return
    setDraft(buildInitialDraft(context))
  }, [open, context])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const isValid = useMemo(() => getIsValid(draft), [draft])
  const canSave = isDirty && isValid && !pending
  const isGameChosen = !!draft?.gameId

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setDraft(initial)
  }

  const handleSave = async () => {
    if (!canSave) return

    try {
      setPending(true)

      const patch = buildPlayerListPatch({ game: activeGame, draft })

      await run('updateGamePlayers', patch, { gameId: activeGame?.id, createIfMissing: true, })

      onClose()
    } finally {
      setPending(false)
    }
  }
  //console.log(activeGame)
  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={pending ? undefined : onClose}
      slotProps={{
        content: {
          sx: sx.drawerContent,
        },
      }}
    >
      <Sheet sx={sx.drawerSheetSx}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <NewFormDrawerHeader player={player} game={activeGame} />
          <ModalClose sx={{ mt: 2, mr: 2 }} />

          <Box className="dpScrollThin" sx={sx.body}>
            <NewFormFieldsDrawer
              draft={draft}
              setField={setField}
              player={player}
              pending={pending}
            />
          </Box>

          <Box sx={sx.footerSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                loading={pending}
                loadingPosition="start"
                disabled={!canSave}
                startDecorator={!pending ? iconUi({ id: 'save' }) : null}
                onClick={handleSave}
                sx={sx.conBut('player')}
              >
                {pending ? 'שומר...' : 'שמירה'}
              </Button>

              <Button
                color="neutral"
                variant="outlined"
                onClick={onClose}
                disabled={pending}
              >
                ביטול
              </Button>

              <Tooltip title="איפוס טופס">
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
                : !draft?.gameId
                  ? 'יש לבחור משחק'
                  : !isValid
                    ? 'יש להשלים נתונים תקינים'
                    : pending
                      ? 'שומר שיוך שחקן למשחק...'
                      : 'מוכן לשמירה'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
