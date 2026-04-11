/// ui/forms/TasksCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import TasksCreateFields from './ui/tasks/TasksCreateFields.js'
import { getTasksCreateFormLayout } from './layouts/tasksCreateForm.layout.js'

const clean = (v) => String(v ?? '').trim()

export default function TasksCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const validity = useMemo(() => {
    const title = clean(draft?.title)
    const workspace = clean(draft?.workspace)
    const taskType = clean(draft?.taskType)

    return {
      title: Boolean(title),
      workspace: Boolean(workspace),
      taskType: Boolean(taskType),
      isValid: Boolean(title && workspace && taskType),
    }
  }, [draft?.title, draft?.workspace, draft?.taskType])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getTasksCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <TasksCreateFields
      draft={draft}
      onDraft={onDraft}
      context={context}
      validity={validity}
      layout={layout}
    />
  )
}
