// previewDomainCard/domains/team/players/components/drawer/TeamPlayerEditDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'
import PlayerPositionFieldPitch from '../../../../../../../../../../ui/fields/selectUi/players/PlayerPositionsSelect'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi'
import { usePlayerHubUpdate } from '../../../../../../../../hooks/usePlayerHubUpdate.js'
import EditDrawerHeader from './EditDrawerHeader.js'
import EditDrawerStatus from './EditDrawerStatus.js'
import {
  safeArr,
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './editDrawer.utils.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawer({
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
          <EditDrawerHeader player={initial} />

          <Box sx={sx.bodySx} className="dpScrollThin">
            <Box sx={sx.sectionCardSx}>
              <Typography sx={sx.sectionTitleSx}>עמדות</Typography>

              <PlayerPositionFieldPitch
                size="sm"
                value={draft.positions}
                onChange={(positions) =>
                  setDraft((prev) => ({
                    ...prev,
                    positions: safeArr(positions),
                  }))
                }
                disabled={pending}
              />
            </Box>

            <EditDrawerStatus draft={draft} setDraft={setDraft} />
          </Box>

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

              <Button color="neutral" variant="outlined" onClick={onClose} disabled={pending}>
                ביטול
              </Button>

              <Tooltip title="איפוס טופס">
                <IconButton disabled={!isDirty} size="sm" variant="soft" sx={sx.icoRes} onClick={handleReset}>
                  {iconUi({id: 'reset'})}
                </IconButton>
              </Tooltip>
            </Box>

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'} >
              {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
