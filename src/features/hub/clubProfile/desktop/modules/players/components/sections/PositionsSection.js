// clubProfile/desktop/modules/players/components/sections/PositionsSection.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { clubPlayersSectionsSx as sx } from '../../sx/clubPlayers.sections.sx.js'

function getPositions(row) {
  return Array.isArray(row?.positions) ? row.positions.filter(Boolean) : []
}

function getGeneralPosition(row) {
  return row?.generalPositionLabel || row?.generalPositionKey || 'ללא עמדה'
}

export default function PositionsSection({ row }) {
  const positions = getPositions(row)
  const generalPosition = getGeneralPosition(row)

  return (
    <Box sx={sx.positionsCol}>
      <Typography
        level="body-xs"
        startDecorator={iconUi({ id: row?.generalPositionKey || 'positions' })}
        sx={sx.sectionTitle}
      >
        {generalPosition}
      </Typography>

      <Box sx={sx.positionsWrap}>
        {positions.length ? (
          positions.map((pos) => (
            <Chip
              key={pos}
              size="sm"
              variant="soft"
              color="neutral"
              sx={{ flexShrink: 0, }}
            >
              {pos}
            </Chip>
          ))
        ) : (
          <Chip
            size="sm"
            variant="soft"
            color="neutral"
            startDecorator={iconUi({ id: 'close' })}
            sx={{ flexShrink: 0, }}
          >
            ללא עמדות
          </Chip>
        )}
      </Box>
    </Box>
  )
}
