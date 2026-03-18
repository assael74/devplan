// teamProfile/modules/players/components/drawer/TeamPlayerPositionsModal.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Drawer,
  Typography,
  Sheet,
  DialogContent,
  DialogTitle,
  ModalClose,
  Tooltip,
  IconButton,
  Chip,
  Snackbar
} from '@mui/joy'

import PlayerPositionFieldPitch from '../../../../../../../ui/fields/selectUi/players/PlayerPositionsSelect.js'

import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { usePlayerHubUpdate } from './../../../../../hooks/players/usePlayerHubUpdate.js'

import { teamPlayersDrawerSx as sx } from './sx/teamPlayers.drawer.sx.js'
import {
  safeArr,
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './logic/teamPlayerQuickEdit.logic.js'

const c = getEntityColors('players')

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
  const canSave = !!initial.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('teamPlayerPositionsEdit', patch, {
      section: 'teamPlayerPositionsEdit',
      playerId: initial.id,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }

  const handleReset = () => {
    setDraft({
      ...initial,
      positions: [...initial.positions],
    })
  }

  return (
    <>
      <Drawer
        size="md"
        variant="plain"
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ content: { sx: sx.drawerSx } }}
      >
        <Sheet sx={sx.drawerSheet}>
          <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={player?.photo || playerImage} />

              <Box sx={{ ml: 2 }}>
                <Typography level="title-md" sx={sx.formNameSx}>
                  {player?.playerFullName || 'שחקן'}
                </Typography>

                <Typography
                  level="body-sm"
                  sx={sx.formNameSx}
                  startDecorator={iconUi({ id: 'positions' })}
                >
                  עריכת עמדת שחקן
                </Typography>
              </Box>
            </Box>

            <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
          </DialogTitle>

          <DialogContent sx={{ gap: 2 }}>
            <Box sx={sx.content} className="dpScrollThin">
            <PlayerPositionFieldPitch
              value={draft.positions}
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

              {!!draft.positions?.length ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {draft.positions.map((pos) => (
                    <Chip
                      key={pos}
                      size="sm"
                      variant="soft"
                      color="primary"
                      startDecorator={iconUi({ id: 'positions' })}
                    >
                      {pos}
                    </Chip>
                  ))}
                </Box>
              ) : (
                <Typography level="body-sm" color="neutral">
                  לא נבחרו עמדות
                </Typography>
              )}
            </Box>
          </DialogContent>

          <Box sx={sx.footerSx}>
            <Box sx={sx.footerActionsSx}>
              <Button
                loading={pending}
                disabled={!canSave}
                startDecorator={iconUi({ id: 'save' })}
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
                    disabled={!isDirty}
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
              {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
            </Typography>
          </Box>
        </Sheet>
      </Drawer>
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
