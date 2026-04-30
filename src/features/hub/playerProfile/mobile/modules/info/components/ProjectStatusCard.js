// playerProfile/mobile/modules/info/components/ProjectStatusCard.js

import React from 'react'
import { Box, Typography, Sheet } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'

import {
  ProjectStatusSelectField,
  PlayerTypeSelector,
} from '../../../../../../../ui/fields'

export default function ProjectStatusCard({ draft, setDraft, pending }) {
  const setField = (key) => (value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const isProject = draft?.type === 'project'

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'project' })}>
          סטטוס פרויקט
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.875, minWidth: 0 }}>
        <Box sx={sx.gridIfa}>
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-end', mb: 0.2 }}>
            <PlayerTypeSelector
              size="xs"
              value={isProject}
              disabled={pending}
              onChange={(next) => {
                setField('type')(next ? 'project' : 'noneType')
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <ProjectStatusSelectField
              value={draft?.projectStatus || ''}
              onChange={(next) => setField('projectStatus')(next || '')}
              size="sm"
              disabled={pending}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
