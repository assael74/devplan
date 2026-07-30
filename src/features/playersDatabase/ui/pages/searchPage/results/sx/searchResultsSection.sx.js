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
    gap: 0.6,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #dbe5f4',
  },

  headerIdentity: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.85,
  },

  headerIcon: entityColors => ({
    width: 36,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    borderRadius: 9,
    bgcolor: entityColors.bg,
    color: entityColors.accent,
  }),

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

  count: entityColors => ({
    minWidth: 72,
    px: 1.1,
    py: 0.35,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    bgcolor: entityColors.bg,
    color: entityColors.accent,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  }),

  state: {
    minHeight: 160,
    display: 'grid',
    placeItems: 'center',
  },

  tableWrap: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    pl: 1,
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarGutter: 'stable',
    border: 0,
    borderRadius: 0,
  },

  table: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',
    '& th, & td': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    '& th:last-of-type, & td:last-of-type': {
      width: 48,
      minWidth: 48,
      maxWidth: 48,
      px: 0.25,
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
    },

    '& th:last-of-type > *, & td:last-of-type > *': {
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
    },

    '& tbody > tr[aria-hidden="true"]': {
      height: 0,
      visibility: 'hidden',

      '& > td': {
        height: 0,
        minHeight: 0,
        p: '0 !important',
        border: '0 !important',
      },
    },

    '& tbody > tr[aria-hidden="true"] > td > div': {
      maxHeight: 0,
    },

    '& tbody > tr[aria-hidden="false"] > td > div': {
      maxHeight: 320,
    },

    '& tbody > tr[aria-hidden] > td > div > div': {
      px: 0.65,
      py: 0.55,
    },

    '& tbody > tr:has(+ tr[aria-hidden="false"]) > td': {
      bgcolor: '#eef4fa',
      borderBottomColor: 'transparent',
    },

    '& tbody > tr[aria-hidden="false"] > td': {
      bgcolor: '#eaf1f8 !important',
    },
  },

  expandedDetails: {
    minWidth: 0,
    pt: 0.45,
    px: 0.65,
    pb: 0.25,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 2fr) minmax(260px, 1fr)',
    },
    gap: 0.45,
    alignItems: 'stretch',
    bgcolor: '#eaf1f8',
    borderTop: '2px solid #c9d9ea',
    borderRadius: '0 0 8px 8px',
  },

  expandedScoutProfiles: {
    minWidth: 0,
    gridColumn: '1 / -1',
  },

  expandedNotesOnly: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },

  expandedItem: {
    minWidth: 0,
    p: 0.8,
    border: '1px solid #dbe5f4',
    borderRadius: 6,
    bgcolor: '#fff',
  },

  expandedLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  expandedValue: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}
