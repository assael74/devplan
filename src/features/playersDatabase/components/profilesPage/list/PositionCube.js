// features/playersDatabase/components/profilesPage/list/PositionCube.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import { positionSx as sx } from './sx/position.sx.js'

export default function PositionCube({ shirtNumber, position, missingDocumentLayer = false }) {
  return (
    <Box sx={[sx.positionCube, missingDocumentLayer ? sx.positionCubeMissing : null]}>
      <Box sx={sx.positionCubeMain}>
        <Typography level="body-xs" sx={sx.positionCubeLabel}>
          חוליה / עמדה
        </Typography>

        <Typography level="body-sm" sx={sx.positionCubeValue}>
          {position || '-'}
        </Typography>
      </Box>

      <Divider orientation="vertical" sx={sx.positionCubeDivider} />

      <Box sx={sx.positionCubeSide}>
        <Typography level="body-xs" sx={sx.positionCubeLabel}>
          מס׳ חולצה
        </Typography>

        <Typography level="body-sm" sx={sx.positionCubeNumber}>
          {shirtNumber || '-'}
        </Typography>
      </Box>
    </Box>
  )
}
