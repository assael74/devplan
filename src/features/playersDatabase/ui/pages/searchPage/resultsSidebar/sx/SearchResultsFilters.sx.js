// features/playersDatabase/ui/pages/searchPage/resultsSidebar/sx/SearchResultsFilters.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultsFiltersSx = {
  filtersSection: {
      mt: 0.8,
      mb: 0,
      pt: 0.8,
      borderTop: '1px solid #e6edf5',
    },

  filtersHeader: {
      mb: 0.65,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0.75,
    },

  filtersTitle: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  filtersReset: {
      minHeight: 26,
      px: 0.6,
      fontSize: 11,
    },

  filtersGrid: {
      display: 'grid',
      gap: 1.7,
    },

  filtersRow: {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 0.65,
    },

  filterField: {
      minWidth: 0,
      display: 'grid',
      gap: 0.25,
    },

  filterLabel: {
      color: devPlanColors.secondary,
    },

  filterInput: {
      minHeight: 30,
      fontSize: 12,
    },

  filterSelect: {
      minHeight: 30,
      fontSize: 12,
    },

  priorityOption: {
      minWidth: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.55,
    },

  priorityOptionIcon: colors => ({
      flexShrink: 0,
      color: colors.main,
      fontSize: 15,
    }),

  priorityOptionLabel: colors => ({
      minWidth: 0,
      color: colors.text,
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.2,
    }),
}
