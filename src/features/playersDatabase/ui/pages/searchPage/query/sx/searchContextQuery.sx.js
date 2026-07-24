// features/playersDatabase/ui/pages/searchPage/query/sx/searchContextQuery.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchContextQuerySx = {
  root: {
    gap: 1.8,
  },

  contextGroup: {
    gap: 0.85,
  },

  filterGroup: {
    gap: 0.7,
  },

  groupLabel: {
    mb: 0.15,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  chipGroup: {
    flexWrap: 'wrap',
    gap: 0.55,
  },

  filterChip: {
    cursor: 'pointer',

    '&[data-variant="solid"]': {
      bgcolor: devPlanColors.primary,
    },
  },
}
