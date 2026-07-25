// features/playersDatabase/ui/pages/teamPage/sx/teamPage.actions.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamPageActionsSx = {
  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  headerActionsPanel: {
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  primaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
