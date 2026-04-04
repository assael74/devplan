// hub/components/preview/views/components/clubDrawer/ClubEditDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { useClubHubUpdate } from '../../../../../hooks/clubs/useClubHubUpdate.js'

import ClubEditDrawerHeader from './ClubEditDrawerHeader.js'
import ClubEditFormDrawer from './ClubEditFormDrawer.js'

import {
  buildClubEditInitial,
  buildClubEditPatch,
  isClubEditDirty,
} from './clubEditDrawer.utils.js'

import { editDrawerSx as sx } from './sx/editDrawer.sx.js'

export default function ClubEditDrawer({ open, club, onClose, onSaved }) {
  const initial = useMemo(() => buildClubEditInitial(club), [club])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isDirty = useMemo(() => isClubEditDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildClubEditPatch(draft, initial), [draft, initial])

  const { run, pending } = useClubHubUpdate(club)
  const canSave = !!club?.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('updateClub', patch, {
      section: 'clubQuickEdit',
      clubId: club?.id,
      createIfMissing: true,
    })

    onSaved?.(patch, { ...club, ...patch })
    onClose?.()
  }

  const handleReset = () => setDraft(initial)

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={pending ? undefined : onClose}
      slotProps={{
        content: {
          sx: sx.drawerSx,
        },
      }}
    >
      <Sheet sx={sx.drawerSheet}>
        <Box sx={sx.drawerRootSx}>
          <ClubEditDrawerHeader
            club={club}
            pending={pending}
          />

          <ClubEditFormDrawer
            draft={draft}
            setDraft={setDraft}
            club={club}
          />

          <Box sx={sx.footerSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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
              {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
