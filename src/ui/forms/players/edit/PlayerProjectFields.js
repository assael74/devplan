// ui/forms/players/edit/PlayerProjectFields.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  PlayerTypeSelector,
  ProjectStatusSelectField,
} from '../../../fields'

export default function PlayerProjectFields({
  draft,
  onField,
  disabled = false,
  layout,
  size = 'sm',
}) {
  const isProject = draft?.type === 'project'

  return (
    <Box sx={layout}>
      <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-end', mb: 0.2 }}>
        <PlayerTypeSelector
          size={size}
          value={isProject}
          disabled={disabled}
          onChange={(value) => {
            onField('type', value ? 'project' : 'noneType')
          }}
        />
      </Box>

      <ProjectStatusSelectField
        value={draft?.projectStatus || ''}
        onChange={(value) => onField('projectStatus', value || '')}
        size={size}
        disabled={disabled}
      />
    </Box>
  )
}
