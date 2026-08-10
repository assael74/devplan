// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskStepper.js

import * as React from 'react'
import {
  Box,
  Stack,
  Typography,
} from '@mui/joy'

import { workTaskStepperSx as sx } from './sx/workTaskStepper.sx.js'

export default function WorkTaskStepper({ activeStep, steps }) {
  return (
    <Stack direction='row' sx={sx.stepBar}>
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const active = index === activeStep
        const complete = index < activeStep

        return (
          <Box key={label} sx={sx.stepItem}>
            <Box
              sx={[
                sx.stepNumber,
                active && sx.stepNumberActive,
                complete && sx.stepNumberComplete,
              ]}
            >
              {stepNumber}
            </Box>

            <Typography
              level='body-xs'
              sx={[
                sx.stepLabel,
                active && sx.stepLabelActive,
              ]}
            >
              {label}
            </Typography>
          </Box>
        )
      })}
    </Stack>
  )
}
