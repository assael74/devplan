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
  panel: (expanded) => ({
    border: '1px solid',
    borderColor: 'divider',
    borderTopLeftRadius: 'var(--joy-radius-sm)',
    borderTopRightRadius: 'var(--joy-radius-sm)',
    borderBottomLeftRadius: expanded ? 0 : 'var(--joy-radius-sm)',
    borderBottomRightRadius: expanded ? 0 : 'var(--joy-radius-sm)',

    '& > *': {
      m: 0,
    },
  }),


  collapseHeader: expanded => ({
    minHeight: 48,
    px: 1.15,
    py: 0.45,
    bgcolor: expanded ? '#eef3f8' : '#eaf0f6',
    color: devPlanColors.primaryDark,
    borderRadius: expanded
      ? 'var(--joy-radius-sm) var(--joy-radius-sm) 0 0'
      : 'var(--joy-radius-sm)',
    borderBottom: expanded ? '1px solid #d6e0eb' : 'none',
    '&:hover': {
      bgcolor: expanded ? '#e7eef6' : '#e2eaf3',
      color: devPlanColors.primaryDark,
    },
  }),

  headerIdentity: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.85,
  },

  headerIcon: entityColors => ({
    width: 32,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    borderRadius: 9,
    bgcolor: entityColors.bg,
    color: entityColors.accent,
  }),

  headerTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
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
