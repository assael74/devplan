// src/features/liveTagging/ui/drawer/flow/LiveZoneStep.js

import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import { LivePitchZones } from './LivePitchZones.js'
import { qualityStepSx as sx } from './sx/qualityStep.sx.js'

export function LiveZoneStep({
  baseAction,
  selectedAction,
  selectedSide,
  onBack,
  onZoneClick,
}) {
  return (
    <Box sx={sx.wrap}>
      <Box sx={sx.zoneHead}>
        <Box>
          <Typography level="body-xs" sx={sx.mutedText}>
            בחירת מיקום
          </Typography>

          <Typography level="title-lg" sx={sx.zoneTitle(selectedSide)}>
            {selectedAction?.label || baseAction?.label || '-'}
          </Typography>

          <Typography level="body-sm" sx={sx.mutedText}>
            לחץ על אזור המגרש שבו הפעולה התרחשה.
          </Typography>
        </Box>

        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={onBack}
        >
          חזור לאיכות
        </Button>
      </Box>

      <LivePitchZones
        side={selectedSide}
        onZoneClick={onZoneClick}
      />
    </Box>
  )
}
