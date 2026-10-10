// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContext.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterContextSx = {
  toolbar: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: {
      xs: 'column',
      lg: 'row',
    },
    gap: 0,
    p: 0.85,
    border: '2px solid #9bbbd2',
    borderRadius: 10,
    bgcolor: '#eaf3fa',
    boxShadow: '0 5px 14px rgba(23, 67, 96, 0.14)',
  },

  filterColumn: {
    position: 'relative',
    width: '100%',
    minWidth: 0,
    flex: {
      xs: '0 0 auto',
      lg: '0 1 70%',
    },
    paddingInlineEnd: 1.25,
  },

  filterRow: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(8.5rem, 0.38fr)',
    alignItems: 'center',
    gap: 0.6,
  },

  chipScroll: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 0.55,
    overflowX: 'auto',
    overflowY: 'hidden',
    pb: 0,
  },

  filterChip: {
    flexShrink: 0,
    minHeight: 26,
    px: 0.85,
    fontWeight: 700,
    cursor: 'pointer',
  },

  birthYearChip: {
    borderColor: '#9dc7e5',
    bgcolor: '#f1f8fd',
    color: '#275f88',
  },

  birthYearChipSelected: {
    borderColor: '#2b6f9f',
    bgcolor: '#2b6f9f',
    color: '#fff',
  },

  seasonChip: {
    borderColor: '#b2cfaa',
    bgcolor: '#f3f8f0',
    color: '#4b753f',
  },

  seasonChipSelected: {
    borderColor: '#5d8b51',
    bgcolor: '#5d8b51',
    color: '#fff',
  },

  filterLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
    whiteSpace: 'nowrap',
  },

  filterLabelSpread: {
    width: '100%',
    justifyContent: 'space-between',
  },

  filterCount: {
    minWidth: 16,
    px: 0.35,
    py: 0.05,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #789bb2',
    borderRadius: 'sm',
    bgcolor: '#fff',
    color: '#1f4e6d',
    fontSize: '0.625rem',
    fontWeight: 700,
    lineHeight: 1.25,
    boxShadow: '0 1px 2px rgba(23, 67, 96, 0.16)',
  },

  resetButton: {
    minWidth: 28,
    minHeight: 28,
    color: devPlanColors.secondary,
    borderColor: '#cbd9e4',
    bgcolor: '#fff',

    '&:hover': {
      color: devPlanColors.primary,
      bgcolor: devPlanColors.primaryLight,
    },
  },

  filterEnd: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
  },

  contextSelect: {
    width: '100%',
    minWidth: 0,
    flex: 1,
    minHeight: 28,
    bgcolor: '#fff',
    borderColor: '#cbd9e4',
    fontSize: 12,
  },

  statusFilters: {
    position: 'relative',
    minWidth: 0,
    flex: {
      xs: '0 0 auto',
      lg: '0 1 30%',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.55,
    p: 0.55,
    border: '1px solid #c8d7e2',
    borderRadius: 8,
    bgcolor: '#fff',
  },

  statusChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.45,
  },
}
