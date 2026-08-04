// features/hub/playerProfile/mobile/modules/info/components/PlayerNamesCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import PlayerNamesFields from '../../../../../../../ui/forms/players/edit/PlayerNamesFields.js'

import { infoModuleSx as sx } from '../info.module.sx.js'

export default function PlayerNamesCard({ draft, setDraft, pending }) {
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
          שם השחקן
        </Typography>
      </Box>

      <PlayerNamesFields
        draft={draft}
        onField={handleField}
        disabled={pending}
        layout={sx.formGrid2}
        showShortName
      />
    </Sheet>
  )
}
