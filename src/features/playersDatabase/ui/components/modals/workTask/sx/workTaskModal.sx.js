// src/features/playersDatabase/ui/components/modals/workTask/sx/workTaskModal.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const workTaskModalSx = {
  modalContent: {
    minHeight: 0,
    p: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  modalBody: {
    width: '100%',
    height: {
      xs: '500px',
      md: '520px',
    },
    maxHeight: {
      xs: 'calc(100dvh - 96px)',
      md: 'calc(100dvh - 120px)',
    },
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) 38px',
    overflow: 'hidden',
  },

  stage: {
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
  },

  actions: {
    height: 38,
    minHeight: 38,
    px: 2,
    py: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderTop: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.surface,
  },

  backButton: {
    minHeight: 30,
    borderColor: devPlanColors.border,
    color: devPlanColors.primary,
  },

  continueButton: {
    minWidth: 96,
    minHeight: 30,
    bgcolor: devPlanColors.tertiaryDark,
    color: '#fff',
    '&:hover': {
      bgcolor: devPlanColors.primary,
    },
  },
}
