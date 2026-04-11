// previewDomainCard/domains/club/teams/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip, Snackbar } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi'
import { useTeamHubUpdate } from '../../../../../../../../hooks/teams/useTeamHubUpdate.js'

import EditDrawerHeader from './EditDrawerHeader.js'
import EditFormDrawer from './EditFormDrawer.js'

import {
  safeArr,
  buildTeamEditInitial,
  buildTeamEditPatch,
  isTeamEditDirty,
} from './editDrawer.utils.js'
import { editDrawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawer({
  open,
  team,
  onClose,
  onSaved,
  context
}) {
  const initial = useMemo(() => buildTeamEditInitial(team), [team])
  const [draft, setDraft] = useState(initial)
  const [showLimitWarning, setShowLimitWarning] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isDirty = useMemo(() => isTeamEditDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildTeamEditPatch(draft, initial), [draft, initial])

  const { run, pending } = useTeamHubUpdate(team)
  const canSave = !!initial.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('teamQuickEdit', patch, {
      section: 'teamQuickEdit',
      teamId: initial.id,
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
          sx: sx.drawerSx,
        },
      }}
    >
      <Sheet sx={sx.drawerSheet}>
        <Box sx={sx.drawerRootSx}>
          <EditDrawerHeader
            team={team}
            pending={pending}
            onClose={onClose}
            context={context}
          />

          <EditFormDrawer
            draft={draft}
            setDraft={setDraft}
            team={team}
            context={context}
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
