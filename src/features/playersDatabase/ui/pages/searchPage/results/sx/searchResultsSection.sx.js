// features/playersDatabase/ui/pages/searchPage/results/sx/searchResultsSection.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultsSectionSx = {
  panel: {
    minWidth: 0,
    minHeight: 0,
    p: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  header: {
    minWidth: 0,
    px: 1.4,
    py: 0.85,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #dbe5f4',
  },

  headerCopy: {
    minWidth: 0,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  subtitle: {
    color: devPlanColors.secondary,
  },

  count: {
    minWidth: 72,
    px: 1.1,
    py: 0.35,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  state: {
    minHeight: 160,
    display: 'grid',
    placeItems: 'center',
  },

  tableWrap: {
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'auto',
    border: 0,
    borderRadius: 0,
  },
  
  table: {
    width: '100%',
    minWidth: 1180,
    tableLayout: 'fixed',
    '& th, & td': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}
