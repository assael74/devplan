// features/playersDatabase/ui/pages/leagueCenterPage/sx/LeagueCenterContext.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterContextSx = {
  contextPanel: {
    order: 2,
    minHeight: 0,
    p: 1,
    borderRadius: 8,
    border: `1px solid ${devPlanColors.primaryLight}`,
    boxShadow: 'none',
    bgcolor: devPlanColors.primaryLight,
  },

  contextRow: {
    width: '100%',
    alignItems: {
      lg: 'flex-end',
    },
  },

  contextField: {
    width: {
      xs: '100%',
      lg: 190,
    },
  },

  contextLabel: {
    mb: 0.5,
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  contextSelect: {
    width: '100%',
    bgcolor: '#fff',
    borderColor: '#cbd9e4',
  },

  contextResetButton: {
    minWidth: 72,
    alignSelf: {
      xs: 'stretch',
      lg: 'flex-end',
    },
    color: devPlanColors.primary,
    borderColor: '#cbd9e4',
    bgcolor: '#fff',
  },

  contextSummary: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    px: 1.25,
    py: 0.25,
    borderRadius: 7,
    border: '1px solid rgba(23, 59, 87, 0.12)',
    bgcolor: 'rgba(255, 255, 255, 0.48)',
    justifyContent: 'center',
    alignSelf: {
      lg: 'stretch',
    },
  },

  contextSummaryLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  contextSummaryValue: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  contextSummaryCaption: {
    color: devPlanColors.secondary,
  },
}
