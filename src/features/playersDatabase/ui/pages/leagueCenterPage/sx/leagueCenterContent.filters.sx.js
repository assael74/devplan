// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContent.filters.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterFiltersSx = {
  filtersCard: {
    order: 3,
    p: 1.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 6px 18px rgba(11, 31, 77, 0.04)',
  },

  filtersRow: {
    width: '100%',
    alignItems: {
      lg: 'center',
    },
  },

  searchInput: {
    flex: 1,
    minWidth: {
      lg: 220,
    },
  },

  filterSelect: {
    minWidth: {
      xs: '100%',
      lg: 180,
    },
  },

  statsGrid: {
    order: 2,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1.25,

    '& > *': {
      minWidth: 0,
    },
  },

  contentGrid: {
    order: 4,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 260px',
    },
    gap: 1.25,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
    },
  },
}
