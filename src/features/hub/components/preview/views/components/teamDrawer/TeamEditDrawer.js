// hub/components/preview/views/components/teamDrawer/TeamEditDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { useTeamHubUpdate } from '../../../../../hooks/teams/useTeamHubUpdate.js'

import TeamEditDrawerHeader from './TeamEditDrawerHeader.js'
import TeamEditFormDrawer from './TeamEditFormDrawer.js'

import {
  buildTeamEditInitial,
  buildTeamEditPatch,
  isTeamEditDirty,
} from './teamEditDrawer.utils.js'

import { editDrawerSx as sx } from './sx/editDrawer.sx.js'

export default function TeamEditDrawer({ open, team, onClose, onSaved, context }) {
  const initial = useMemo(() => buildTeamEditInitial(team), [team])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isDirty = useMemo(() => isTeamEditDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildTeamEditPatch(draft, initial), [draft, initial])

  const { run, pending } = useTeamHubUpdate(team)
  const canSave = !!team?.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('updateTeam', patch, {
      section: 'teamQuickEdit',
      teamId: team?.id,
      createIfMissing: true,
    })

    onSaved(patch, { ...team, ...patch })
    onClose()
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
          <TeamEditDrawerHeader
            team={team}
            pending={pending}
            onClose={onClose}
            context={context}
          />

          <TeamEditFormDrawer
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
