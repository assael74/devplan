// previewDomainCard/domains/player/games/components/newExForm/NewExFormDrawer.js

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

import useGameHubCreate from '../../../../../../../../hooks/games/useGameHubCreate.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import NewExFormDrawerHeader from './NewExFormDrawerHeader.js'
import NewExFormFieldsDrawer from './NewExFormFieldsDrawer.js'

import {
  buildInitialExDraft,
  getIsExDirty,
  getExValidity,
  normalizeExDraftBeforeSave,
} from './newExFormDrawer.utils.js'

import { drawerNewFormSx as sx } from '../../sx/newFormDrawer.sx.js'

export default function NewExFormDrawer({ open, onClose, onSaved, context }) {
  const player = context?.player || context?.entity || null

  const initial = useMemo(() => buildInitialExDraft(context), [context])
  const [draft, setDraft] = useState(initial)

  const { saving, runCreateGame } = useGameHubCreate()

  useEffect(() => {
    if (!open) return
    setDraft(buildInitialExDraft(context))
  }, [open, context])

  const validity = useMemo(() => getExValidity(draft), [draft])
  const isDirty = useMemo(() => getIsExDirty(draft, initial), [draft, initial])
  const canSave = isDirty && validity?.ok && !saving

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setDraft(initial)
  }

  const handleSave = async () => {
    if (!canSave) return

    const normalizedDraft = normalizeExDraftBeforeSave(draft)

    const payload = {
      ...normalizedDraft,
      playerId: normalizedDraft?.playerId || player?.id || null,
      teamId: normalizedDraft?.teamId || context?.teamId || player?.teamId || '',
      clubId: normalizedDraft?.clubId || context?.clubId || player?.clubId || '',
      gameSource: 'external',
      isExternalGame: true,
      playerSource: 'private',
    }

    const created = await runCreateGame({
      draft: payload,
      context: {
        ...context,
        player,
        playerId: payload.playerId,
        teamId: payload.teamId,
        clubId: payload.clubId,
        gameSource: 'external',
        isExternalGame: true,
        playerSource: 'private',
      },
    })

    onSaved(created)
    onClose()
  }

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={saving ? undefined : onClose}
      slotProps={{
        content: {
          sx: sx.drawerContent,
        },
      }}
    >
      <Sheet sx={sx.drawerSheetSx}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <NewExFormDrawerHeader player={player} />
          <ModalClose sx={{ mt: 2, mr: 2 }} />

          <Box className="dpScrollThin" sx={sx.body}>
            <NewExFormFieldsDrawer
              draft={draft}
              setField={setField}
              player={player}
              context={context}
              validity={validity}
              pending={saving}
            />
          </Box>

          <Box sx={sx.footerSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                loading={saving}
                loadingPosition="start"
                disabled={!canSave}
                startDecorator={!saving ? iconUi({ id: 'save' }) : null}
                onClick={handleSave}
                sx={sx.conBut('private')}
              >
                {saving ? 'שומר...' : 'יצירת משחק'}
              </Button>

              <Button
                color="neutral"
                variant="outlined"
                onClick={onClose}
                disabled={saving}
              >
                ביטול
              </Button>

              <Tooltip title="איפוס טופס">
                <span>
                  <IconButton
                    disabled={!isDirty || saving}
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
                  ? validity?.message || 'יש להשלים נתונים תקינים'
                  : saving
                    ? 'יוצר משחק חיצוני חדש...'
                    : 'מוכן ליצירה'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
