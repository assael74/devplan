// src/features/liveTagging/ui/drawer/flow/LivePitchZones.js

import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import {
  PITCH_ZONES_18_GRID,
  getPitchZoneByNumber,
} from '../../../../../shared/liveTagging/index.js'

import { pitchZonesSx as sx } from './sx/pitchZones.sx.js'

export function LivePitchZones({ side, onZoneClick }) {
  return (
    <Box sx={sx.pitchWrap}>
      <Box sx={sx.pitchEdgeLabel}>התקפה</Box>

      <Box sx={sx.pitchGrid}>
        {PITCH_ZONES_18_GRID.flat().map((zoneNumber, index) => {
          const zone = getPitchZoneByNumber(zoneNumber)
          const rowIndex = Math.floor(index / 3)

          return (
            <Button
              key={zoneNumber}
              variant="plain"
              sx={sx.zoneButton({ side, rowIndex })}
              onClick={() => onZoneClick(zoneNumber)}
            >
              <Typography level="title-lg" sx={sx.zoneNumber}>
                {zone?.number}
              </Typography>
            </Button>
          )
        })}
      </Box>

      <Box sx={sx.pitchEdgeLabel}>הגנה</Box>
    </Box>
  )
}
