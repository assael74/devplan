// features/playersDatabase/ui/pages/leagueCenterPage/sx/LeagueCenterHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterHeaderSx = {
  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) auto',
    },
    gap: 2,
    alignItems: 'end',
  },

  headerCopy: {
    minWidth: 0,
    gap: 0.5,
    alignItems: 'flex-start',
  },

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
