// clubProfile/modules/teams/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
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

import EditHeaderDrawer from './EditHeaderDrawer'
import EditContentDrawer from './EditContentDrawer'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { getFullDateIl } from '../../../../../../../shared/format/dateUtiles.js'
import { resolveEntityAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { useTeamHubUpdate } from '../../../../../hooks/teams/useTeamHubUpdate.js'
import { useLifecycle } from '../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import { editDrawerSx as sx } from './sx/editDrawer.sx.js'
import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './logic/clubTeamEdit.logic.js'

const c = getEntityColors('clubs')

const clean = (v) => (v && String(v).trim() ? v : '')

export default function EditDrawer({
  open,
  team,
  context,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildInitialDraft(team), [team])
  const [draft, setDraft] = useState(initial)
  const lifecycle = useLifecycle()

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const isValid = useMemo(() => {
    return !!String(draft?.teamName || '').trim() && !!String(draft?.teamYear || '').trim()
  }, [draft])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = useTeamHubUpdate(team)
  const canSave = !!initial.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('clubTeamEdit', patch, {
      section: 'clubTeamEdit',
      teamId: initial.id,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }

  const handleReset = () => {
    setDraft({ ...initial })
  }

  const handleDelete = useCallback(() => {
    if (!team?.id) return

    lifecycle.openLifecycle(
      { entityType: 'team', id: team.id, name: `${team?.teamName || 'קבוצה'}`, },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'team') return
          if (id !== team.id) return

          onClose()
        },
      }
    )
  }, [lifecycle, team?.id, team?.teamName, onClose])

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
        <EditHeaderDrawer team={team} onClose={onClose} club={context?.club} />

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <EditContentDrawer draft={draft} setDraft={setDraft} />
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

            <Tooltip title="מחיקת קבוצה">
              <span>
                <IconButton
                  size="sm"
                  color='danger'
                  variant="solid"
                  onClick={handleDelete}
                >
                  {iconUi({ id: 'delete' })}
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Typography level="body-xs" color={!isValid ? 'warning' : isDirty ? 'danger' : 'neutral'}>
            {!isValid ? 'יש שדות חובה חסרים' : isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
