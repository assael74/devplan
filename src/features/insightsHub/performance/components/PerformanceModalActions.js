// features/insightsHub/performance/components/PerformanceModalActions.js

import React from 'react'
import { Box, Button } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  cardSx,
} from './sx/card.sx.js'

const getIconId = panel => {
  if (panel.type === 'numbers') return 'rate'
  if (panel.type === 'cases') return 'summary'
  if (panel.type === 'details') return 'info'

  return 'performanceProfile'
}

export default function PerformanceModalActions({ panels, onOpen }) {
  if (!panels?.length) return null

  return (
    <Box sx={cardSx.modalAction}>
      {panels.map(panel => (
        <Button
          key={panel.id}
          size="md"
          variant="outlined"
          color="primary"
          startDecorator={iconUi({ id: getIconId(panel) })}
          onClick={() => onOpen(panel)}
          sx={cardSx.infoButton}
        >
          {panel.label}
        </Button>
      ))}
    </Box>
  )
}
