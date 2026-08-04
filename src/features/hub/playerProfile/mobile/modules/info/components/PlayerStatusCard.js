// features/hub/playerProfile/mobile/modules/info/components/PlayerStatusCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import PlayerContactFields from '../../../../../../../ui/forms/players/edit/PlayerContactFields.js'

import { infoModuleSx as sx } from '../info.module.sx.js'

export default function PlayerStatusCard({ draft, setDraft, pending }) {
  const handleField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography
          level="title-md"
          noWrap
          startDecorator={iconUi({ id: 'info' })}
        >
          סטטוס וטלפון
        </Typography>
      </Box>

      <PlayerContactFields
        draft={draft}
        onField={handleField}
        disabled={pending}
        topLayout={sx.gridIfa}
        bottomLayout={sx.formGrid2}
      />
    </Sheet>
  )
}
