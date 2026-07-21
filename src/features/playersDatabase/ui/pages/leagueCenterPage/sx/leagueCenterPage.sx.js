// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterPage.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterPageSx = {
  page: {
    width: '100%',
    maxWidth: 1560,
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    mx: 'auto',
    px: {
      xs: 2,
      md: 1.5,
    },
    py: {
      xs: 1.5,
      md: 1,
    },
    display: 'grid',
    gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },

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
