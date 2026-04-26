// features/home/components/editDrawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import TasksCreateFields from '../../../../../ui/forms/ui/tasks/TasksCreateFields.js'

import { useTaskUpdate } from '../../../sharedHook/useTaskUpdate.js'
import { useLifecycle } from '../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './editDrawer.utils.js'

import {
  getTaskStatusMeta,
  getTaskTypeMeta,
} from '../../../../../shared/tasks/tasks.constants.js'

function getTaskEditValidity(draft = {}) {
  return {
    title: String(draft?.title || '').trim().length > 0,
    workspace: String(draft?.workspace || '').trim().length > 0,
    taskType: String(draft?.taskType || '').trim().length > 0,
  }
}

export default function EditDrawer({
  open,
  task,
  onClose,
  onSaved,
  context,
}) {
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
  const validity = useMemo(() => getTaskEditValidity(draft), [draft])

  const isValid = validity.title && validity.workspace && validity.taskType

  const { run, pending } = useTaskUpdate(initial.raw)

  const saving = isSaving || pending
  const canSave = !!draft?.id && isDirty && isValid && !saving

  const layout = useMemo(
    () => ({
      topCols: { xs: '1fr', md: '1fr' },
      mainCols: { xs: '1fr', md: '1fr' },
      metaCols: { xs: '1fr', md: '1.1fr 1fr .9fr' },
    }),
    []
  )

  const handleSave = useCallback(async () => {
    if (!canSave) return

    try {
      setIsSaving(true)

      await run('taskQuickEdit', patch, {
        section: 'taskQuickEdit',
        taskId: draft.id,
      })

      onSaved(patch, { ...initial.raw, ...patch })
      onClose()
    } catch (error) {
      console.error('EditDrawer save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [canSave, run, patch, initial.id, initial.raw, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const handleDelete = useCallback(() => {
    if (!task?.id) return

    lifecycle.openLifecycle(
      {
        entityType: 'task',
        id: task?.id,
        name: task?.title || 'משימה',
      },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'task') return
          if (id !== task.id) return

          onClose?.()
        },
      }
    )
  }, [lifecycle, task?.id, task?.title, onClose])

  const taskTypeMeta = getTaskTypeMeta(draft?.workspace, draft?.taskType)
  const statusMeta = getTaskStatusMeta(draft?.status)

  const status = !isValid
    ? { text: 'יש להשלים שדות חובה', color: 'warning' }
    : saving
    ? { text: 'שומר עדכון...', color: 'primary' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

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
        onDelete: handleDelete,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס טופס',
        delete: 'מחיקת משימה',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="task"
          title={draft?.title || 'עריכת משימה'}
          subline={
            [
              taskTypeMeta?.label || 'משימה',
              draft?.workspace || '',
              statusMeta?.label || '',
            ]
              .filter(Boolean)
              .join(' · ') || 'פרטי משימה'
          }
          titleIconId={taskTypeMeta?.idIcon || 'task'}
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <TasksCreateFields
          draft={draft}
          onDraft={setDraft}
          context={context}
          validity={validity}
          layout={layout}
        />
      </Box>
    </DrawerShell>
  )
}
