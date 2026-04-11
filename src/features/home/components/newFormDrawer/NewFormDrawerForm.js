// features/home/components/newFormDrawer/NewFormDrawerForm.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import TasksCreateFields from '../../../../ui/forms/ui/tasks/TasksCreateFields.js'
import { newDrawerSx as sx } from './sx/newFormDrawer.sx.js'
import { getTaskCreateValidity } from './logic/newFormDrawer.utils.js'

export default function NewFormDrawerForm({ draft, setDraft, context }) {
  const validity = useMemo(() => getTaskCreateValidity(draft), [draft])

  const layout = useMemo(
    () => ({
      topCols: { xs: '1fr', md: '1fr' },
      mainCols: { xs: '1fr', md: '1fr' },
      metaCols: { xs: '1fr', md: '1.2fr .9fr .9fr' },
    }),
    []
  )

  return (
    <Box sx={sx.bodySx} className="dpScrollThin">
      <Box sx={sx.sectionCardSx(draft?.workspace === 'app' ? 'taskApp' : 'taskAnalyst')}>
        <TasksCreateFields
          draft={draft}
          onDraft={setDraft}
          context={context}
          validity={validity}
          layout={layout}
          fieldDisabled={{ workspace: true, url: true, status: true }}
        />
      </Box>
    </Box>
  )
}
