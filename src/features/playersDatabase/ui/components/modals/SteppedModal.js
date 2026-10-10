// src/features/playersDatabase/ui/components/modals/SteppedModal.js

import { Box } from '@mui/joy'

import ModalStepper from './ModalStepper.js'
import RegularModal from './RegularModal.js'
import { steppedModalSx as sx } from './sx/steppedModal.sx.js'

export default function SteppedModal({
  activeStep = 0,
  children,
  compactStepper = false,
  completedSteps,
  disabledSteps,
  layoutSx,
  stepContentSx,
  steps,
  appearance = 'default',
  ...modalProps
}) {
  return (
    <RegularModal appearance={appearance} {...modalProps}>
      <Box sx={[
        sx.layout,
        appearance === 'destructive' ? sx.destructiveLayout : null,
        layoutSx,
      ]}>
        <ModalStepper
          activeStep={activeStep}
          completedSteps={completedSteps}
          disabledSteps={disabledSteps}
          steps={steps}
          compact={compactStepper}
        />

        <Box sx={[
          sx.stepContent,
          appearance === 'destructive' ? sx.destructiveStepContent : null,
          stepContentSx,
        ]}>
          {children}
        </Box>
      </Box>
    </RegularModal>
  )
}
