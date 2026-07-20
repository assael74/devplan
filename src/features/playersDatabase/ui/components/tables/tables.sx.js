// features/playersDatabase/ui/components/tables/tables.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const pdbTableSx = {
  wrap: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    bgcolor: '#fff',
  },

  splitWrap: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    overflow: 'hidden',
  },

  headerWrap: {
    minWidth: 0,
    overflow: 'hidden',
    borderBottom: '1px solid #dbe5f4',
  },

  bodyWrap: {
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  headerTable: {
    '& th': {
      borderBottom: 0,
    },
  },

  bodyTable: {
    '& tbody tr:first-of-type td': {
      borderTop: 0,
    },
  },

  table: {
    width: '100%',
    minWidth: 0,
    fontSize: 12,

    '& th': {
      px: 1,
      py: 0.75,
      bgcolor: '#f5f8fd',
      color: devPlanColors.primaryDark,
      fontWeight: 700,
      whiteSpace: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.15,
      borderBottom: '1px solid #dbe5f4',
    },

    '& td': {
      px: 1,
      py: 0.65,
      whiteSpace: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
    },

    '& th:first-of-type, & td:first-of-type': {
      textAlign: 'left',
      pr: 1.5,
      pl: 1.5,
    },

    '& th:not(:first-of-type), & td:not(:first-of-type)': {
      textAlign: 'center',
    },

    '& tbody tr:hover': {
      bgcolor: devPlanColors.primaryLight,
    },
  },

  emptyText: {
    py: 2,
    textAlign: 'center',
    color: devPlanColors.secondary,
  },
}
