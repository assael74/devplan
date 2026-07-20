// features/playersDatabase/ui/pages/sx/center.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const centerSx = {
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

  pageDescription: {
    maxWidth: 760,
    color: devPlanColors.secondary,
    textAlign: 'left',
  },

  heroGraphic: {
    gridArea: 'visual',
    position: 'relative',
    width: 370,
    height: 150,
    minWidth: 0,
    minHeight: 0,
    justifySelf: 'end',
    display: {
      xs: 'none',
      lg: 'block',
    },
  },

  heroGlobe: {
    position: 'absolute',
    left: 82,
    top: 0,
    width: 150,
    height: 150,
    borderRadius: '50%',
    border: '1px solid #d9e6f8',
    background: `
      radial-gradient(
        circle,
        rgba(36, 108, 214, 0.14),
        rgba(255, 255, 255, 0) 68%
      )
    `,
  },

  floatCard: {
    position: 'absolute',
    borderRadius: 8,
    bgcolor: '#fff',
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 22px rgba(11, 31, 77, 0.08)',
  },

  floatChartCard: {
    left: 0,
    top: 4,
    width: 112,
    height: 64,
    p: 1.25,
  },

  floatTrendCard: {
    left: 0,
    top: 82,
    width: 132,
    height: 60,
    p: 1.25,
  },

  floatProfileCard: {
    left: 158,
    top: 42,
    width: 202,
    height: 68,
    p: 1.25,
    display: 'grid',
    gridTemplateColumns: '42px minmax(0, 1fr)',
    gap: 1,
    alignItems: 'center',
  },

  primaryButton: {
    bgcolor: devPlanColors.primary,
    color: '#fff',
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },

  barChart: {
    height: 32,
    display: 'flex',
    gap: 0.7,
    alignItems: 'flex-end',
  },

  barItem: {
    width: 10,
    borderRadius: 2,
    bgcolor: '#8fb4ea',
  },

  trendLine: {
    height: 24,
    borderRadius: 8,
    borderBottom: '3px solid #6aa5ef',
  },

  profileAvatar: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: '50%',
    bgcolor: '#dce8f7',
  },

  profileContent: {
    minWidth: 0,
  },

  profileLine: {
    width: 96,
    maxWidth: '100%',
    height: 8,
    borderRadius: 4,
    bgcolor: '#d7e2f1',
  },

  profileNumbers: {
    color: '#0c7a43',
    whiteSpace: 'nowrap',
  },

  pageTitle: {
    color: '#0b1f4d',
    fontSize: {
      xs: 38,
      md: 48,
    },
    lineHeight: 1,
    fontWeight: 700,
  },

  pageDescription: {
    display: 'none',
    maxWidth: 540,
    color: '#42526e',
    textAlign: 'left',
  },

  actions: {
    mt: 0.5,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

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

  tableButton: {
    minHeight: 28,
    px: 1.25,
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
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
