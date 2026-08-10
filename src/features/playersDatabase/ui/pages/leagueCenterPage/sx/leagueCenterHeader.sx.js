// features/playersDatabase/ui/pages/leagueCenterPage/sx/LeagueCenterHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterHeaderSx = {
  pageTitle: {
    color: '#0b1f4d',
    fontSize: {
      xs: 38,
      md: 48,
    },
    lineHeight: 1,
    fontWeight: 700,
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  primaryButton: {
    bgcolor: devPlanColors.primary,
    color: '#fff',
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
