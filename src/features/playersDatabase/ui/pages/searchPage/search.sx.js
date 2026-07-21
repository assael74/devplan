// features/playersDatabase/ui/pages/searchPage/search.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const searchSx = {
  page: {
    width: '100%',
    maxWidth: 1560,
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    mx: 'auto',
    px: {
      xs: 2,
      md: 1.5,
    },
    py: {
      xs: 1.5,
      md: 1,
    },
    display: 'grid',
    gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },

  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) auto',
    },
    gap: 2,
    alignItems: 'end',
  },

  headerCopy: {
    minWidth: 0,
    gap: 0.5,
    alignItems: 'flex-start',
  },

  pageTitle: {
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 34,
      md: 42,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  pageDescription: {
    maxWidth: 760,
    color: devPlanColors.secondary,
    textAlign: 'left',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  primaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },

  filtersPanel: {
    minWidth: 0,
    p: 1.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 6px 18px rgba(11, 31, 77, 0.04)',
  },

  statsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,

    '& > *': {
      minWidth: 0,
      minHeight: 104,
      maxHeight: 116,
      p: 1.25,
    },

    '& h2': {
      fontSize: 28,
      lineHeight: 1,
    },

    '& [class*="MuiTypography-body-sm"]': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 13,
    },

    '& [class*="MuiTypography-body-xs"]': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 11,
    },
  },

  contentGrid: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 280px',
    },
    gap: 1.25,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
      height: '100%',
    },
  },

  resultsPanel: {
    minWidth: 0,
    minHeight: 0,
    p: 0,
    display: 'grid',
    gridTemplateRows: '44px minmax(0, 1fr)',
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  resultsHeader: {
    minWidth: 0,
    minHeight: 44,
    px: 1.25,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #dbe5f4',
  },

  panelTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  resultsCount: {
    px: 1,
    py: 0.25,
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  tableWrap: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    border: 0,
    borderRadius: 0,
  },

  resultsTable: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',

    '& th, & td': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  avatarColumn: {
    width: 44,
    minWidth: 44,
    maxWidth: 44,
    px: 0.5,
    textAlign: 'center',
  },

  playerColumn: {
    width: '12%',
  },

  teamColumn: {
    width: '13%',
  },

  leagueColumn: {
    width: '12%',
  },

  primaryProfileColumn: {
    width: '13%',
  },

  secondaryProfileColumn: {
    width: '13%',
  },

  reliabilityColumn: {
    width: 72,
    textAlign: 'center',
  },

  scoreColumn: {
    width: 78,
    textAlign: 'center',
  },

  noteColumn: {
    width: '17%',
  },

  actionsColumn: {
    width: 108,
    textAlign: 'center',
  },

  playerAvatar: {
    width: 28,
    height: 28,
    display: 'block',
    mx: 'auto',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  tableButton: {
    minWidth: 0,
    minHeight: 28,
    maxWidth: '100%',
    px: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  activityPanel: {
    minWidth: 0,
    minHeight: 0,
    p: 1.25,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  activityList: {
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.4,
  },

  activityItem: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
    p: 0.85,
    borderRadius: 7,
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  activityLabel: {
    color: devPlanColors.secondary,
  },

  activityValue: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },
}
