// features/playersDatabase/ui/pages/searchPage/resultsSidebar/sx/searchResultsSummary.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultsSummarySx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },
  item: {
    minWidth: 0,
    px: 0.75,
    py: 0.6,
    borderRadius: 6,
    bgcolor: '#f4f7fb',
    border: '1px solid #e6edf5',
  },
  label: {
    color: devPlanColors.secondary,
    fontSize: 10,
    lineHeight: 1.15,
  },
  value: {
    mt: 0.1,
    color: devPlanColors.primaryDark,
    fontSize: 18,
    fontWeight: 700,
  },
}
