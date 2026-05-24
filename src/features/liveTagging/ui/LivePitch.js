// src/features/liveTagging/ui/LivePitch.js

import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import {
  PITCH_ZONES_18_GRID,
  getPitchZoneByNumber,
} from '../../../shared/liveTagging/index.js'

import { sx } from './sx/liveTagging.sx.js'

export function LivePitch({
  selectedZoneNumber,
  actionSide,
  disabled,
  onZoneClick,
}) {
  return (
    <Box sx={sx.pitchWrap}>
      <Box sx={sx.pitchHead}>
        <Typography level="body-xs" sx={sx.mutedText}>
          התקפה
        </Typography>
      </Box>

      <Box sx={sx.pitchGrid(disabled)}>
        {PITCH_ZONES_18_GRID.flat().map((zoneNumber) => {
          const zone = getPitchZoneByNumber(zoneNumber)
          const selected = selectedZoneNumber === zoneNumber

          return (
            <Button
              key={zoneNumber}
              disabled={disabled}
              variant={selected ? 'solid' : 'soft'}
              color={selected ? 'primary' : 'neutral'}
              sx={sx.zoneButton({ selected, side: actionSide })}
              onClick={() => onZoneClick(zoneNumber)}
            >
              <Typography level="title-md" sx={sx.zoneNumber}>
                {zone?.number}
              </Typography>
            </Button>
          )
        })}
      </Box>

      <Box sx={sx.pitchFoot}>
        <Typography level="body-xs" sx={sx.mutedText}>
          הגנה
        </Typography>
      </Box>
    </Box>
  )
}
