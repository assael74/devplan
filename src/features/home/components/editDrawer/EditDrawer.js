// features/home/components/editDrawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { useTaskUpdate } from '../../hooks/useTaskUpdate.js'
import { useLifecycle } from '../../../../ui/domains/entityLifecycle/LifecycleProvider'

import EditDrawerHeader from './EditDrawerHeader.js'
import EditFormDrawer from './EditFormDrawer.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './logic/editDrawer.utils.js'

import { drawerSx as sx } from './sx/editDrawer.sx.js'

export default function EditDrawer({ open, task, onClose, onSaved, context }) {
  const initial = useMemo(() => buildInitialDraft(task), [task])
  const [draft, setDraft] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)
  const lifecycle = useLifecycle()

  useEffect(() => {
    if (!open) return
    setDraft(initial)
    setIsSaving(false)
  }, [open, initial])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = useTaskUpdate(initial.raw)

  const saving = isSaving || pending
  const canSave = !!initial.id && isDirty && !saving

  const handleSave = async () => {
    if (!canSave) return

    try {
      setIsSaving(true)

      await run('taskQuickEdit', patch, {
        section: 'taskQuickEdit',
        taskId: initial.id,
      })

      onSaved(patch, { ...initial.raw, ...patch })
      onClose()
    } catch (error) {
      console.error('EditDrawer save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (saving) return
    setDraft(initial)
  }

  const handleDelete = useCallback(() => {
    if (!task?.id) return

    lifecycle.openLifecycle(
      { entityType: 'task', id: task?.id, name: task?.title, },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'task') return
          if (id !== task.id) return

          onClose()
        },
      }
    )
  }, [lifecycle, task?.id, task?.title, onClose])

  const taskType = task?.workspace === 'app' ? 'taskApp' : 'taskAnalyst'

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
          <EditDrawerHeader task={task} />

          <EditFormDrawer
            draft={draft}
            setDraft={setDraft}
            task={task}
            context={context}
          />

          <Box sx={sx.footerSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                loading={saving}
                loadingPosition="start"
                disabled={!canSave}
                startDecorator={!saving ? iconUi({ id: 'save' }) : null}
                onClick={handleSave}
                sx={sx.conBut(taskType)}
              >
                {saving ? 'שומר...' : 'שמירה'}
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

              <Tooltip title="מחיקת משימה">
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

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
              {saving ? 'שומר עדכון...' : isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
