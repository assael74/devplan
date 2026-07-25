// features/playersDatabase/ui/pages/playerPage/sx/playerPage.actions.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerPageActionsSx = {
  headerActionsPanel: {
    height: '100%',
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  primaryButton: {
    minHeight: 38,
    px: 2,
    gap: 0.75,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    minHeight: 38,
    px: 2,
    gap: 0.75,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },

    '&:disabled': {
      bgcolor: '#f4f7fa',
      borderColor: '#d6e0ea',
      color: '#96a4b1',
    },
  },
}
