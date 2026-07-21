// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContent.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterContentSx = {
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

  tableScroll: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',

    '& table': {
      fontSize: 12,
    },

    '& th': {
      px: 1,
      py: 0.75,
    },

    '& td': {
      px: 1,
      py: 0.65,
    },

    '& button': {
      minWidth: 0,
      minHeight: 28,
      px: 1.25,
      fontSize: 12,
    },
  },

  tableBodyScroll: {
    maxHeight: '100%',
  },

  leagueNameColumn: {
    width: '34%',
    minWidth: 260,
  },

  leagueNameHeader: {
    textAlign: 'left',
    pl: 1.5,
    pr: 1.5,
  },

  leagueNameCell: {
    textAlign: 'left',
    pl: 1.5,
    pr: 1.5,
  },

  centerColumn: {
    textAlign: 'center',
  },

  compactColumn: {
    width: 76,
  },

  seasonColumn: {
    width: 96,
  },

  countColumn: {
    width: 86,
    textAlign: 'center',
  },

  actionsColumn: {
    width: 82,
    textAlign: 'center',
  },

  rowActions: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  actionIconPlaceholder: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },

  actionIconButton: {
    minWidth: 28,
    width: 28,
    height: 28,
    minHeight: 28,
    p: 0,
    color: devPlanColors.primary,
    borderColor: '#c7dbf8',
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  missingPanel: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    p: 1,
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  missingContent: {
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.25,
  },

  missingList: {
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.5,
  },

  panelTitle: {
    color: '#0b1f4d',
    fontSize: 18,
    fontWeight: 700,
  },

  missingItem: {
    display: 'grid',
    gridTemplateColumns: '8px minmax(0, 1fr) auto',
    gap: 0.75,
    alignItems: 'center',
    p: 0.75,
    borderRadius: 8,
    border: `1px solid ${devPlanColors.primaryLight}`,
    bgcolor: '#fff',
  },

  missingDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    bgcolor: devPlanColors.primary,
  },

  missingTitle: {
    color: '#1769d7',
    fontSize: 12,
    fontWeight: 700,
  },

  missingValue: {
    color: '#0b1f4d',
    fontSize: 14,
  },
}
