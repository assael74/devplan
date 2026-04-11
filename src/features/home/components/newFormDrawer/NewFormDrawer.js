// features/home/components/newFormDrawer/NewFormDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import useTaskCreate from '../../hooks/useTaskCreate.js'

import NewFormDrawerHeader from './NewFormDrawerHeader.js'
import NewFormDrawerForm from './NewFormDrawerForm.js'

import {
  buildInitialDraft,
  getTaskCreateValidity,
  getIsDirty,
  getIsValid,
  getDrawerEntityByWorkspace,
} from './logic/newFormDrawer.utils.js'

import { newDrawerSx as sx } from './sx/newFormDrawer.sx.js'

export default function NewFormDrawer({ open, taskContext, onClose, onCreated }) {
  const initial = useMemo(() => buildInitialDraft(taskContext), [taskContext])
  const [draft, setDraft] = useState(initial)

  const { saving, runCreateTask } = useTaskCreate()

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const validity = useMemo(() => getTaskCreateValidity(draft), [draft])
  const isValid = useMemo(() => getIsValid(validity), [validity])
  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])

  const entity = getDrawerEntityByWorkspace(draft?.workspace)
  const canSave = isValid && !saving

  const handleSave = async () => {
    if (!canSave) return

    try {
      const created = await runCreateTask({
        draft,
        context: taskContext,
      })

      onCreated?.(created)
      onClose?.()
    } catch (error) {
      console.error('NewFormDrawer create failed:', error)
    }
  }

  const handleReset = () => {
    if (saving) return
    setDraft(initial)
  }

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={saving ? undefined : onClose}
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
          <NewFormDrawerHeader draft={draft} />

          <NewFormDrawerForm
            draft={draft}
            setDraft={setDraft}
            context={taskContext}
          />

          <Box sx={sx.footerSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                loading={saving}
                loadingPosition="start"
                disabled={!canSave}
                startDecorator={!saving ? iconUi({ id: 'save' }) : null}
                onClick={handleSave}
                sx={sx.conBut(entity)}
              >
                {saving ? 'יוצר...' : 'יצירת משימה'}
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

            <Typography level="body-xs" color={!isValid ? 'danger' : isDirty ? 'warning' : 'neutral'}>
              {!isValid
                ? 'יש להשלים שדות חובה'
                : saving
                ? 'יוצר משימה...'
                : isDirty
                ? 'יש שינויים שלא נשמרו'
                : 'מוכן ליצירה'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
