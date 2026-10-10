// features/playersDatabase/ui/components/tables/dataTable/sx/dataTable.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const dataTableSx = {
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
    overflowX: 'hidden',
    overflowY: 'scroll',
    borderBottom: '1px solid #dbe5f4',
    // Reserve the same scrollbar gutter as the scrollable body table.
    // Without it, the split header has a few pixels more width and its
    // column boundaries drift from the body in RTL layouts.
    scrollbarWidth: 'thin',
    scrollbarColor: 'transparent transparent',

    '&::-webkit-scrollbar': {
      width: 6,
    },

    '&::-webkit-scrollbar-track, &::-webkit-scrollbar-thumb': {
      background: 'transparent',
    },
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
