// src/features/hub/teamProfile/sharedUi/insights/teamPlayers/buildSection/BuildSection.js

import React from 'react'
import { Box } from '@mui/joy'

import AspectBlock from './AspectBlock.js'

import { buildSx as sx } from './sx/build.sx'

export default function BuildSection({ model = {} }) {
  const cards = model.cards || {}

  return (
    <Box sx={sx.subSection}>
      <Box sx={sx.buildLayout}>
        <AspectBlock
          id="squadRole"
          type="role"
          title="מעמד בסגל"
          icon="keyPlayer"
          cards={cards}
        />

        <AspectBlock
          id="positions"
          type="position"
          title="עמדה"
          icon="positions"
          cards={cards}
        />
      </Box>
    </Box>
  )
}
