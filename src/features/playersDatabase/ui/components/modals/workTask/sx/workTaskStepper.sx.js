// src/features/playersDatabase/ui/components/modals/workTask/sx/workTaskStepper.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const stepNumber = {
  width: 28,
  height: 28,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  bgcolor: devPlanColors.border,
  color: devPlanColors.secondary,
  fontSize: 12,
  fontWeight: 700,
}

const stepLabel = {
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: devPlanColors.secondary,
  textAlign: 'center',
}

export const workTaskStepperSx = {
  stepBar: {
    px: 2,
    py: 1.25,
    display: 'flex',
    gap: 0.75,
    borderBottom: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.secondaryLight,
  },

  stepItem: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    justifyItems: 'center',
    gap: 0.5,
  },

  resolveStepNumber: (active, complete) => ({
    ...stepNumber,
    ...(active ? {
      bgcolor: devPlanColors.primary,
      color: '#fff',
    } : {}),
    ...(complete ? {
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiaryDark,
    } : {}),
  }),

  resolveStepLabel: active => ({
    ...stepLabel,
    ...(active ? {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    } : {}),
  }),
}
