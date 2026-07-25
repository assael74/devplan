// features/playersDatabase/ui/pages/leaguePage/sx/leaguePage.actions.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leaguePageActionsSx = {
  actionsPanel: {
      gap: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },

  actions: {
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
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
