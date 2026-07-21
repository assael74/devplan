// features/playersDatabase/ui/pages/playerPage/player.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const playerSx = {
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
    gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
    gap: 1.5,
    overflow: 'hidden',
  },

  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) 220px auto',
    },
    gap: 1.5,
    alignItems: 'center',
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

  reliabilityRow: {
    mt: 0.25,
    alignItems: 'center',
  },

  reliabilityLabel: {
    color: devPlanColors.secondary,
  },

  reliabilityDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: '#2e9f58',
  },

  reliabilityValue: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignSelf: 'end',
  },

  primaryButton: {
    minHeight: 38,
    px: 2,
    gap: 0.75,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    minHeight: 38,
    px: 2,
    gap: 0.75,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },

  summaryGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: '320px minmax(0, 1fr)',
    },
    gap: 1.25,
    alignItems: 'stretch',
  },

  playerSummary: {
    minWidth: 0,
    p: 1.5,
    display: 'grid',
    gridTemplateColumns: '96px minmax(0, 1fr)',
    gap: 1.5,
    alignItems: 'center',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  headerPlayer: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '64px minmax(0, 1fr)',
    gap: 1,
    alignItems: 'center',
  },

  playerAvatar: {
    width: 60,
    height: 60,
    display: 'block',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `3px solid ${devPlanColors.primaryLight}`,
  },

  playerDetails: {
    minWidth: 0,
  },

  playerName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  playerMeta: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.secondary,
  },

  teamName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  statsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
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
      xl: 'minmax(0, 1fr) 360px',
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

  mainContent: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    gap: 1.25,
    overflow: 'hidden',
  },

  profilesPanel: {
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

  panelHeader: {
    minWidth: 0,
    minHeight: 44,
    px: 1.25,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  panelTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  panelCount: {
    px: 1,
    py: 0.25,
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  profilesTableWrap: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    border: 0,
    borderRadius: 0,
  },

  profilesTable: {
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

  profileNameColumn: {
    width: '55%',
  },

  profileScoreColumn: {
    width: '20%',
    textAlign: 'center',
  },

  profileReliabilityColumn: {
    width: '25%',
    textAlign: 'center',
  },

  reasonsPanel: {
    minWidth: 0,
    minHeight: 0,
    p: 1.5,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  panelIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
  },

  reasonsList: {
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.5,
  },

  reasonItem: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '7px minmax(0, 1fr)',
    gap: 1,
    alignItems: 'start',
  },

  reasonDot: {
    width: 7,
    height: 7,
    mt: 0.75,
    borderRadius: '50%',
    bgcolor: devPlanColors.primary,
  },

  reasonText: {
    color: devPlanColors.secondary,
  },

  contextPanel: {
    minWidth: 0,
    p: 1.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  contextGrid: {
    mt: 1,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  contextItem: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
    p: 0.75,
    borderRadius: 7,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  contextLabel: {
    color: devPlanColors.secondary,
  },

  contextValue: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  footerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  footerButton: {
    minHeight: 36,
    px: 1.5,
    gap: 0.75,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },

  footerPrimaryButton: {
    minHeight: 36,
    px: 1.5,
    gap: 0.75,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },
}
