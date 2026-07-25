// features/playersDatabase/ui/components/tables/tables.base.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const pdbTableBaseSx = {
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
    tableLayout: 'fixed',
    fontSize: 12,

    '& th': {
      position: 'relative',
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
      textAlign: 'center',
      pr: 1.5,
      pl: 1.5,
    },

    '& tbody tr:hover': {
      bgcolor: devPlanColors.primaryLight,
    },
  },
}
