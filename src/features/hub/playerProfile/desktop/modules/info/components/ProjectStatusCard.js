// features/hub/playerProfile/desktop/modules/info/components/ProjectStatusCard.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import PlayerProjectFields from '../../../../../../../ui/forms/players/edit/PlayerProjectFields.js'

import { isProjectPlayer } from '../../../../../../../shared/players/players.logic.js'

import { sharedSx as sx } from './sx/shared.sx.js'

const TEXT = {
  title: 'סטטוס פרויקט',
  project: 'פרויקט',
  general: 'כללי',
}

export default function ProjectStatusCard({ draft, setDraft, pending }) {
  const isProject = isProjectPlayer(draft?.type)

  const handleField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          <Typography level="title-md" noWrap>
            {TEXT.title}
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={isProject ? 'success' : 'neutral'}
          startDecorator={iconUi({
            id: isProject ? 'project' : 'noneType',
          })}
        >
          {isProject ? TEXT.project : TEXT.general}
        </Chip>
      </Box>

      <PlayerProjectFields
        draft={draft}
        onField={handleField}
        disabled={pending}
        layout={sx.gridStatus}
      />
    </Sheet>
  )
}
