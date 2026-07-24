// features/playersDatabase/ui/pages/searchPage/resultsSidebar/sx/searchResultsSummary.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultsSummarySx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.75,
  },
  item: {
    minWidth: 0,
    p: 1,
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
