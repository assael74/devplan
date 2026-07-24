// features/playersDatabase/ui/pages/searchPage/resultFilters/sx/searchResultSummary.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultSummarySx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.7,
  },

  item: {
    p: 0.9,
    borderRadius: 7,
    bgcolor: '#f4f7fb',
    border: '1px solid #e6edf5',
  },

  label: {
    color: devPlanColors.secondary,
  },
  
  value: {
    mt: 0.2,
    color: devPlanColors.primaryDark,
    fontSize: 24,
    fontWeight: 700,
  },
}
