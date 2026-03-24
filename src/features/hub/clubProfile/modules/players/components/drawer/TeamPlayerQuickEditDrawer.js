// teamProfile/modules/players/components/drawer/TeamPlayerQuickEditDrawer.js

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
} from '@mui/joy'

import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { usePlayerHubUpdate } from './../../../../../hooks/players/usePlayerHubUpdate.js'
import ProjectStatusSelectField from '../../../../../../../ui/fields/checkUi/players/ProjectStatusSelectField.js'
import PlayerActiveSelector from '../../../../../../../ui/fields/checkUi/players/PlayerActiveSelector.js'
import PlayerKeyPlayerSelector from '../../../../../../../ui/fields/checkUi/players/PlayerKeyPlayerSelector.js'
import PlayerTypeSelector from '../../../../../../../ui/fields/checkUi/players/PlayerTypeSelector.js'

import { teamPlayersDrawerSx as sx } from './sx/teamPlayers.drawer.sx.js'
import {
  safeArr,
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './logic/teamPlayerQuickEdit.logic.js'

const c = getEntityColors('players')

export default function TeamPlayerQuickEditDrawer({
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
  const canSave = !!initial.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('playerQuickEdit', patch, {
      section: 'teamPlayerQuickEdit',
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

              <Typography level="body-sm" sx={sx.formNameSx} startDecorator={iconUi({ id: 'info' })}>
                עריכת פרטי שחקן
              </Typography>
            </Box>
          </Box>

          <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
        </DialogTitle>

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <PlayerActiveSelector
              size="md"
              value={draft.active}
              onChange={() => setDraft((prev) => ({ ...prev, active: !prev.active }))}
             />

             <PlayerKeyPlayerSelector
               size="md"
               value={draft.isKey}
               onChange={() => setDraft((prev) => ({ ...prev, isKey: !prev.isKey }))}
              />

             <PlayerTypeSelector
               size="md"
               value={draft.type}
               onChange={(next) => setDraft((p) => ({ ...p, type: next || 'noneType' }))}
              />

             <ProjectStatusSelectField
               label="סטטוס פרויקט"
               size="sm"
               value={draft.projectStatus}
               onChange={(v) => setDraft((p) => ({ ...p, projectStatus: v }))}
               disabled={pending}
             />
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
  )
}
