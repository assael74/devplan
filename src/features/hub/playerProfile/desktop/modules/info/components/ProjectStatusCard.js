// playerProfile/desktop/modules/info/components/ProjectStatusCard.js

import React from 'react'
import { Box, Typography, Sheet, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { sharedSx as sx } from './sx/shared.sx.js'

import {
  isProjectPlayer,
} from '../../../../../../../shared/players/players.logic.js'

import {
  ProjectStatusSelectField,
  PlayerTypeSelector,
} from '../../../../../../../ui/fields'

export default function ProjectStatusCard({ draft, setDraft, pending }) {
  const isProject = isProjectPlayer(draft?.type)

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi({ id: 'project', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            סטטוס פרויקט
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={isProject ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: isProject ? 'project' : 'noneType' })}
        >
          {isProject ? 'פרויקט' : 'כללי'}
        </Chip>
      </Box>

      <Box sx={sx.gridStatus}>
        <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-end', mb: 0.2 }}>
          <PlayerTypeSelector
            size="sm"
            value={draft?.type === 'project'}
            disabled={pending}
            onChange={(next) => {
              setDraft((prev) => ({
                ...prev,
                type: next ? 'project' : 'noneType',
              }))
            }}
          />
        </Box>

        <ProjectStatusSelectField
          value={draft?.projectStatus || ''}
          onChange={(next) => {
            setDraft((prev) => ({
              ...prev,
              projectStatus: next || '',
            }))
          }}
          size="sm"
          disabled={pending}
        />
      </Box>
    </Sheet>
  )
}
