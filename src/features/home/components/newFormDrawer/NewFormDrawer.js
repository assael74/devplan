// features/home/components/newFormDrawer/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import TasksCreateFields from '../../../../ui/forms/ui/tasks/TasksCreateFields.js'

import useTaskCreate from '../../hooks/useTaskCreate.js'

import {
  buildInitialDraft,
  getTaskCreateValidity,
  getIsDirty,
  getIsValid,
} from './newFormDrawer.utils.js'

import {
  getTaskStatusMeta,
  getTaskTypeMeta,
  getTaskWorkspaceMeta,
} from '../../../../shared/tasks/tasks.constants.js'

const layout = {
  topCols: { xs: '1fr', md: '1fr' },
  mainCols: { xs: '1fr', md: '1fr' },
  metaCols: { xs: '1fr', md: '1.2fr .9fr .9fr' },
}

export default function NewFormDrawer({
  open,
  taskContext,
  onClose,
  onCreated,
}) {
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

  const workspaceMeta = getTaskWorkspaceMeta(draft?.workspace)
  const statusMeta = getTaskStatusMeta(draft?.status)
  const taskTypeMeta = getTaskTypeMeta(draft?.workspace, draft?.taskType)

  const canSave = isValid && !saving

  const handleSave = useCallback(async () => {
    if (!canSave) return

    try {
      const created = await runCreateTask({
        draft,
        context: taskContext,
      })

      onCreated(created)
      onClose()
    } catch (error) {
      console.error('NewFormDrawer create failed:', error)
    }
  }, [canSave, runCreateTask, draft, taskContext, onCreated, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const status = !isValid
    ? { text: 'יש להשלים שדות חובה', color: 'warning' }
    : saving
    ? { text: 'יוצר משימה...', color: 'primary' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'מוכן ליצירה', color: 'neutral' }

  return (
    <DrawerShell
      entity="task"
      open={open}
      onClose={onClose}
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
      }}
      texts={{
        save: 'יצירת משימה',
        saving: 'יוצר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס טופס',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="task"
          title="משימה חדשה"
          subline={[
            workspaceMeta?.label || 'אזור עבודה',
            taskTypeMeta?.label || 'כללי',
            statusMeta?.label || '',
          ].filter(Boolean).join(' · ')}
          titleIconId={taskTypeMeta?.idIcon || 'addTask'}
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <TasksCreateFields
          draft={draft}
          onDraft={setDraft}
          context={taskContext}
          validity={validity}
          layout={layout}
          fieldDisabled={{ workspace: true, url: true, status: true }}
        />
      </Box>
    </DrawerShell>
  )
}
