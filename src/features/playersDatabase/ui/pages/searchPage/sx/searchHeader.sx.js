// features/playersDatabase/ui/pages/searchPage/sx/searchHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const searchHeaderSx = {
  root: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
    gap: 2,
    alignItems: 'end',
  },

  copy: {
    minWidth: 0,
    gap: 0.4,
    alignItems: 'flex-start',
  },

  title: {
    color: devPlanColors.primaryDark,
    fontSize: { xs: 32, md: 40 },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  actions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  
  leaguesButton: {
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
