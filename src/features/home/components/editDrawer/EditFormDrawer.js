// features/home/components/editDrawer/EditFormDrawer.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import TasksCreateFields from '../../../../ui/forms/ui/tasks/TasksCreateFields.js'
import { drawerSx as sx } from './sx/editDrawer.sx.js'

function getTaskEditValidity(draft = {}) {
  return {
    title: String(draft?.title || '').trim().length > 0,
    workspace: String(draft?.workspace || '').trim().length > 0,
    taskType: String(draft?.taskType || '').trim().length > 0,
  }
}

export default function EditFormDrawer({ draft, setDraft, task, context }) {
  const validity = useMemo(() => getTaskEditValidity(draft), [draft])

  const layout = useMemo(
    () => ({
      topCols: { xs: '1fr', md: '1fr' },
      mainCols: { xs: '1fr', md: '1fr' },
      metaCols: { xs: '1fr', md: '1.2fr .9fr .9fr' },
    }),
    []
  )

  const taskType = task?.workspace === 'app' ? 'taskApp' : 'taskAnalyst'

  return (
    <Box sx={sx.bodySx} className="dpScrollThin">
      <Box sx={sx.sectionCardSx(taskType)}>
        <TasksCreateFields
          draft={draft}
          onDraft={setDraft}
          context={context}
          validity={validity}
          layout={layout}
        />
      </Box>
    </Box>
  )
}
