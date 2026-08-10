// src/features/playersDatabase/ui/components/modals/workTask/sx/workTaskContext.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const workTaskContextSx = {
  leaguePageContext: {
      mb: 1.15,
      px: 1.15,
      py: 0.75,
      display: 'flex',
      alignItems: 'stretch',
      gap: 0.75,
      border: `1px solid ${devPlanColors.border}`,
      borderRadius: 10,
      bgcolor: devPlanColors.primaryLight,
    },

  leaguePageContextItem: {
      minWidth: 0,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.15,
    },

  leaguePageContextValue: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: devPlanColors.primaryDark,
      fontSize: 16,
      fontWeight: 700,
    },

  reviewContextLabel: {
      color: devPlanColors.secondary,
      fontWeight: 700,
    },

  yearFocus: {
      mb: 1,
      px: 1.25,
      py: 0.8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      border: `1px solid ${devPlanColors.border}`,
      borderRadius: 10,
      bgcolor: devPlanColors.primaryLight,
    },

  yearFocusLabel: {
      color: devPlanColors.secondary,
      fontWeight: 700,
    },

  yearFocusValue: {
      color: devPlanColors.primaryDark,
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1,
    },

  reviewContext: {
      mb: 1,
      px: 1.2,
      py: 0.75,
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 1,
      border: `1px solid ${devPlanColors.border}`,
      borderRadius: 10,
      bgcolor: devPlanColors.primaryLight,
    },

  reviewContextValue: {
      mt: 0.2,
      color: devPlanColors.primaryDark,
      fontSize: 20,
      fontWeight: 700,
    },
}
