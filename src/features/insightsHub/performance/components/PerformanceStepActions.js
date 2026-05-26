// features/insightsHub/performance/components/PerformanceStepActions.js

import React from 'react'
import { Box, Button } from '@mui/joy'

import {
  actionsSx,
} from './sx/actions.sx.js'

export default function PerformanceStepActions({ isLast, label, onNext }) {
  if (isLast) return null

  return (
    <Box sx={actionsSx.root}>
      <Button
        size="lg"
        variant="solid"
        color="primary"
        onClick={onNext}
        sx={actionsSx.nextButton}
      >
        {label || 'המשך בהסבר'}
      </Button>
    </Box>
  )
}
