// src/features/liveTagging/ui/LiveZonesDrawer.js

import React from 'react'
import { Box, Button, Drawer, ModalClose, Typography } from '@mui/joy'

import {
  PITCH_ZONES_18_GRID,
  getPitchZoneByNumber,
} from '../../../shared/liveTagging/index.js'

import { sx } from './sx/liveTagging.sx.js'

export function LiveZonesDrawer({ open, action, onClose, onZoneClick }) {
  const side = action?.side

  return (
    <Drawer
      anchor="bottom"
      size='lg'
      open={open}
      onClose={onClose}
      slotProps={{
        content: {
          sx: sx.zonesDrawer,
        },
      }}
    >
      <ModalClose />

      <Box sx={sx.zonesDrawerHead}>
        <Typography level="body-xs" sx={sx.mutedText}>
          בחירת אזור
        </Typography>

        <Typography level="title-lg" sx={sx.drawerActionTitle(side)}>
          {action?.label || '-'}
        </Typography>

        <Typography level="body-sm" sx={sx.mutedText}>
          לחץ על אזור המגרש שבו הפעולה התרחשה
        </Typography>
      </Box>

      <Box sx={sx.pitchWrap}>
        <Box sx={sx.pitchEdgeLabel}>התקפה</Box>

        <Box sx={sx.pitchGrid}>
          {PITCH_ZONES_18_GRID.flat().map((zoneNumber) => {
            const zone = getPitchZoneByNumber(zoneNumber)

            return (
              <Button
                key={zoneNumber}
                variant="plain"
                sx={sx.zoneButton(side)}
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
    </Drawer>
  )
}
