// features/playersDatabase/ui/pages/searchPage/resultFilters/sx/searchResultFiltersPanel.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultFiltersPanelSx = {
  panel: {
    minWidth: 0,
    minHeight: 0,
    p: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  header: {
    px: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.8,
    borderBottom: '1px solid #dbe5f4',
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  subtitle: {
    color: devPlanColors.secondary,
  },

  resetButton: {
    color: devPlanColors.primary,
  },

  scroll: {
    minHeight: 0,
    flex: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
    p: 1.15,
    gap: 1.1,
  },
  
  filterBlock: {
    minWidth: 0,
    '& > *': {
      mt: 0,
    },
  },
}
