// features/hub/playerProfile/mobile/modules/info/components/ProjectStatusCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import PlayerProjectFields from '../../../../../../../ui/forms/players/edit/PlayerProjectFields.js'

import { infoModuleSx as sx } from '../info.module.sx.js'

export default function ProjectStatusCard({ draft, setDraft, pending }) {
  const handleField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography
          level="title-md"
          noWrap
          startDecorator={iconUi({ id: 'project' })}
        >
          סטטוס פרויקט
        </Typography>
      </Box>

      <PlayerProjectFields
        draft={draft}
        onField={handleField}
        disabled={pending}
        layout={sx.gridIfa}
        size="xs"
      />
    </Sheet>
  )
}
