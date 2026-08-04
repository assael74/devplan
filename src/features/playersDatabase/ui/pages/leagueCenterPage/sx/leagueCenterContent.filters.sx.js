// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContent.filters.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterFiltersSx = {
  contextPanel: {
    order: 2,
    minHeight: 0,
    p: 1,
    borderRadius: 8,
    border: `1px solid ${devPlanColors.primaryLight}`,
    boxShadow: 'none',
    bgcolor: devPlanColors.primaryLight,
  },

  contextRow: {
    width: '100%',
    alignItems: { lg: 'flex-end' },
  },

  contextField: {
    width: { xs: '100%', lg: 190 },
  },

  contextLabel: {
    mb: 0.5,
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  contextSelect: {
    width: '100%',
    bgcolor: '#fff',
    borderColor: '#cbd9e4',
  },

  contextSummary: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    px: 1.25,
    py: 0.25,
    borderRadius: 7,
    border: '1px solid rgba(23, 59, 87, 0.12)',
    bgcolor: 'rgba(255, 255, 255, 0.48)',
    justifyContent: 'center',
    alignSelf: { lg: 'stretch' },
  },

  contextSummaryLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  contextSummaryValue: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  contextSummaryCaption: {
    color: devPlanColors.secondary,
  },

  contentGrid: {
    order: 3,
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(0, 1fr)',
      xl: 'minmax(0, 1fr) 300px',
    },
    gap: 1.5,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
    },
  },

  mainColumn: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },

  statsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1,

    '& > *': {
      minWidth: 0,
      minHeight: 88,
      p: 1.1,
    },
  },

  summaryCard: {
    borderColor: '#dde6ed',
    boxShadow: '0 3px 10px rgba(16, 43, 64, 0.035)',
    bgcolor: '#fff',
  },

  tableFilters: {
    width: '100%',
    px: 1,
    py: 0.85,
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    alignItems: { md: 'center' },
  },

  tableSearch: {
    flex: 1,
    minWidth: { md: 240 },
    bgcolor: '#fff',
  },

  tableStatusSelect: {
    minWidth: { xs: '100%', md: 190 },
    bgcolor: '#fff',
  },

  resetButton: {
    color: devPlanColors.primary,
    borderColor: '#cbd9e4',
    bgcolor: '#fff',
  },
}
