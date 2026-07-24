// features/playersDatabase/ui/pages/searchPage/query/sx/searchQueryPanel.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const QUERY_COLUMN_HEIGHT = 390

const columnBase = {
  minWidth: 0,
  alignSelf: 'stretch',

  height: {
    xs: 'auto',
    xl: QUERY_COLUMN_HEIGHT,
  },

  maxHeight: {
    xs: 'none',
    xl: QUERY_COLUMN_HEIGHT,
  },

  overflowX: 'hidden',

  overflowY: {
    xs: 'visible',
    xl: 'auto',
  },

  '& > *': {
    height: {
      xs: 'auto',
      xl: 'auto',
    },

    minHeight: {
      xs: 0,
      xl: '100%',
    },

    overflow: 'visible',
  },
}

export const searchQueryPanelSx = {
  panel: {
    minWidth: 0,
    m: 0,
    p: 0,
    gap: 0,
    overflow: 'hidden',
    border: '1px solid #dbe5f4',
    borderRadius: 15,
    bgcolor: '#fff',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',

    '& > *': {
      m: 0,
    },
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  resetButton: {
    color: devPlanColors.primary,
    whiteSpace: 'nowrap',
  },

  collapseContent: {
    m: 0,
    mt: '0 !important',
    p: 0,
    overflow: 'hidden',
    borderTop: '1px solid #dbe5f4',
  },

  collapseInner: {
    m: 0,
    p: 0,
  },

  grid: {
    minWidth: 0,
    display: 'grid',

    gridTemplateColumns: {
      xs: 'minmax(0, 1fr)',
      md: 'repeat(2, minmax(0, 1fr))',
      xl: [
        'minmax(250px, 1.05fr)',
        'minmax(410px, 1.72fr)',
        'minmax(185px, 0.68fr)',
        'minmax(240px, 0.72fr)',
      ].join(' '),
    },

    gap: 0.8,
    alignItems: 'stretch',
    p: 0.9,
    bgcolor: '#f3f7fb',
  },

  column: columnBase,

  contextColumn: {
    order: 1,
  },

  modelsColumn: {
    order: 2,
  },

  statsColumn: {
    order: 3,
  },

  summaryColumn: {
    order: 4,
  },
}
