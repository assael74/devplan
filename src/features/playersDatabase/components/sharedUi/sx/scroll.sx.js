// features/playersDatabase/components/sharedUi/sx/scroll.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const scrollRailSx = {
  railRoot: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  railButton: {
    bgcolor: devPlanColors.secondary,
    color: devPlanColors.primaryDark,
    '&:hover': {
      bgcolor: devPlanColors.primary,
      '& .MuiSvgIcon-root, & svg': {
        color: '#ffffff',
      },
    },
    '& .MuiSvgIcon-root, & svg': {
      color: '#ffffff',
    },
  },

  railContent: {
    display: 'flex',
    gap: 1,
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollBehavior: 'smooth',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '& > *': {
      flex: '0 0 auto',
    },
  },
}
