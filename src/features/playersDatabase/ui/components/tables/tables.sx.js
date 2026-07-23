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

  sortButton: {
    width: '100%',
    minWidth: 0,
    p: 0,
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
    bgcolor: 'transparent',
    border: 0,
    font: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      color: devPlanColors.tertiary,
    },

    '&:focus-visible': {
      outline: `2px solid ${devPlanColors.tertiary}`,
      outlineOffset: 2,
      borderRadius: 4,
    },
  },

  sortButtonActive: {
    color: devPlanColors.primaryDark,
  },

  sortLabel: {
    width: '100%',
    minWidth: 0,
    display: 'block',
    whiteSpace: 'normal',
    textAlign: 'center',
  },

  sortIndicatorActive: {
    position: 'absolute',
    insetInlineEnd: 2,
    color: devPlanColors.tertiary,
    fontSize: 7,
    lineHeight: 1,
    pointerEvents: 'none',
  },

  cellLink: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    gap: 0.65,
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    borderRadius: 5,
    transition: 'color 140ms ease, background-color 140ms ease',

    '&:hover, &:focus-visible': {
      color: devPlanColors.primaryDark,
      bgcolor: '#dce8f0',
      outline: 'none',
    },

    '&:hover [data-link-indicator], &:focus-visible [data-link-indicator]': {
      opacity: 0.85,
      transform: 'scale(1)',
    },
  },

  cellLinkText: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  cellLinkIndicator: {
    flex: '0 0 auto',
    width: 5,
    height: 5,
    borderRadius: '50%',
    bgcolor: 'currentColor',
    opacity: 0,
    transform: 'scale(0.65)',
    transition: 'opacity 140ms ease, transform 140ms ease',
  },

  emptyText: {
    py: 2,
    textAlign: 'center',
    color: devPlanColors.secondary,
  },
}
