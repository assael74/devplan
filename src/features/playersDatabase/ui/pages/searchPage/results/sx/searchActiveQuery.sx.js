// features/playersDatabase/ui/pages/searchPage/results/sx/searchActiveQuery.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchActiveQuerySx = {
  root: {
    minWidth: 0,
    minHeight: 44,
    px: 1.25,
    py: 0.8,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    borderBottom: '1px solid #edf1f5',
    bgcolor: '#fbfcfe',
  },

  compact: {
    minWidth: 0,
    display: 'grid',
    gap: 0.6,
  },

  label: {
    flex: '0 0 auto',
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  items: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  chip: {
    cursor: 'pointer',
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
  },
  
  empty: {
    color: devPlanColors.secondary,
    lineHeight: 1.45,
  },
}
