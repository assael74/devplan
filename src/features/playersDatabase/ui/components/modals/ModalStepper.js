// src/features/playersDatabase/ui/components/modals/ModalStepper.js

import {
  Box,
  Stack,
  Typography,
} from '@mui/joy'

import { modalStepperSx as sx } from './sx/modalStepper.sx.js'

const hasStepState = (state, index) => (
  Array.isArray(state)
    ? state.includes(index)
    : Boolean(state?.[index])
)

const normalizeStep = step => (
  typeof step === 'string'
    ? { label: step }
    : step || {}
)

export default function ModalStepper({
  activeStep = 0,
  completedSteps,
  disabledSteps,
  steps = [],
  compact = false,
}) {
  return (
    <Stack direction='row' sx={[sx.stepBar, compact ? sx.stepBarCompact : null]}>
      {steps.map((step, index) => {
        const definition = normalizeStep(step)
        const active = index === activeStep
        const complete = !active && (
          definition.completed === true || hasStepState(completedSteps, index) || index < activeStep
        )
        const disabled = definition.disabled === true || hasStepState(disabledSteps, index)

        return (
          <Box key={definition.id || definition.label || index} sx={[sx.stepItem, compact ? sx.stepItemCompact : null]}>
            <Box sx={sx.resolveStepNumber(active, complete, disabled, compact)}>
              {index + 1}
            </Box>

            <Typography
              level='body-xs'
              sx={sx.resolveStepLabel(active, disabled)}
            >
              {definition.label}
            </Typography>
          </Box>
        )
      })}
    </Stack>
  )
}
