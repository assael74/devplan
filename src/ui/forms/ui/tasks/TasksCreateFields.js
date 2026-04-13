// ui/forms/ui/tasks/TasksCreateFields.js

import React, { useMemo } from 'react'
import { Box, Typography, Divider, Chip } from '@mui/joy'

import TaskTitleField from '../../../fields/inputUi/tasks/TaskTitleField.js'
import TaskUrlField from '../../../fields/inputUi/tasks/TaskUrlField.js'
import TaskDescriptionField from '../../../fields/inputUi/tasks/TaskDescriptionField.js'
import TaskDueDateField from '../../../fields/inputUi/tasks/TaskDueDateField.js'

import TaskWorkspaceSelectField from '../../../fields/selectUi/tasks/TaskWorkspaceSelectField.js'
import TaskStatusSelectField from '../../../fields/selectUi/tasks/TaskStatusSelectField.js'
import TaskPrioritySelectField from '../../../fields/selectUi/tasks/TaskPrioritySelectField.js'
import TaskComplexitySelectField from '../../../fields/selectUi/tasks/TaskComplexitySelectField.js'
import TaskTypeSelectField from '../../../fields/selectUi/tasks/TaskTypeSelectField.js'

import { pcfSx } from './sx/tasksCreateForm.sx.js'

const clean = (v) => String(v ?? '').trim()

export default function TasksCreateFields({
  onDraft,
  layout,
  draft = {},
  context = {},
  validity = {},
  fieldDisabled = {},
}) {
  const setField = (key, value) => {
    onDraft((prev) => {
      const next = {
        ...(prev || {}),
        [key]: value,
      }

      if (key === 'workspace') {
        const currentTaskType = clean(next?.taskType)
        const workspaceChanged = clean(prev?.workspace) !== clean(value)

        if (workspaceChanged && currentTaskType) {
          next.taskType = ''
        }
      }

      return next
    })
  }

  const requiredCount = useMemo(() => {
    return [validity?.title, validity?.workspace, validity?.taskType].filter(Boolean).length
  }, [validity?.title, validity?.workspace, validity?.taskType])

  return (
    <Box sx={pcfSx.root(layout)}>
      <Box sx={pcfSx.block(layout.topCols, 1)}>
        <TaskTitleField
          value={draft?.title || ''}
          onChange={(value) => setField('title', value)}
          required
          error={!validity?.title}
          helperText={!validity?.title ? 'יש להזין כותרת למשימה' : ''}
        />

        <TaskWorkspaceSelectField
          value={draft?.workspace || ''}
          required
          error={!validity?.workspace}
          disabled={fieldDisabled?.workspace}
          onChange={(value) => setField('workspace', value)}
          helperText={!validity?.workspace ? 'יש לבחור אזור עבודה' : ''}
        />
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={pcfSx.title}>
          פרטי משימה
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.mainCols, 2)}>
        <TaskDescriptionField
          value={draft?.description || ''}
          onChange={(value) => setField('description', value)}
        />
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={pcfSx.title}>
          סיווג וניהול
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.metaCols, 1)}>
        <TaskTypeSelectField
          workspace={draft?.workspace || ''}
          value={draft?.taskType || ''}
          required
          error={!validity?.taskType}
          onChange={(value) => setField('taskType', value)}
          helperText={!validity?.taskType ? 'יש לבחור סוג משימה' : ''}
        />

        <TaskStatusSelectField
          value={draft?.status || ''}
          disabled={fieldDisabled?.status}
          onChange={(value) => setField('status', value)}
        />

        <TaskPrioritySelectField
          value={draft?.priority || ''}
          onChange={(value) => setField('priority', value)}
        />

        <TaskDueDateField
          value={draft?.dueDate || ''}
          onChange={(value) => setField('dueDate', value)}
        />

        <TaskComplexitySelectField
          value={draft?.complexity || ''}
          onChange={(value) => setField('complexity', value)}
        />
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={pcfSx.title}>
          קישור למשימה
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.topCols, 1)}>
        <TaskUrlField
          value={draft?.url || ''}
          disabled={fieldDisabled?.url}
          onChange={(value) => setField('url', value)}
        />
      </Box>
    </Box>
  )
}
