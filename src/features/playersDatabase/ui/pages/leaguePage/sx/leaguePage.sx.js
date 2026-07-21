// features/playersDatabase/ui/pages/leaguePage/sx/leaguePage.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leaguePageSx = {
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
      gridTemplateRows: 'auto auto minmax(0, 1fr)',
      gap: 2,
      overflow: 'hidden',
    },

  header: {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        lg: 'minmax(760px, 1fr) auto',
      },
      gap: 2,
      alignItems: 'end',
    },

  headerCopy: {
      minWidth: 0,
      width: '100%',
      gap: 0.75,
      alignItems: 'flex-start',
    },

  pageTitle: {
      flexShrink: 0,
      whiteSpace: 'nowrap',
      color: devPlanColors.primaryDark,
      fontSize: {
        xs: 34,
        md: 44,
      },
      lineHeight: 1.05,
      fontWeight: 700,
    },

  titleRow: {
      minWidth: 0,
      display: 'flex',
      flexWrap: {
        xs: 'wrap',
        md: 'nowrap',
      },
      alignItems: 'center',
      gap: 1,
      justifyContent: 'flex-start',
    },

  titleRegion: {
      color: devPlanColors.tertiary,
      mr: 2
    },

  titleChip: {
      minHeight: 28,
      px: 1.2,
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      borderRadius: 999,
      bgcolor: devPlanColors.primaryLight,
      border: `1px solid ${devPlanColors.primary}`,
      color: devPlanColors.primary,
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1,
      whiteSpace: 'nowrap',
    },

  titleChips: {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      gap: 1,
      pt: 1
    },

  titleChipTertiary: {
      bgcolor: devPlanColors.tertiaryLight,
      borderColor: devPlanColors.tertiary,
      color: devPlanColors.tertiary,
    },

  pageDescription: {
      maxWidth: 760,
      color: devPlanColors.secondary,
      textAlign: 'left',
    },

  actionsPanel: {
      gap: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },

  actions: {
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

  statsGrid: {
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

  summaryStatCard: {
      minWidth: 0,
      minHeight: 96,
      p: 1.25,
      display: 'grid',
      gridTemplateRows: 'minmax(0, 1fr) auto',
      gap: 0.75,
      borderRadius: 8,
      border: '1px solid #dbe5f4',
      boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
      overflow: 'hidden',
    },

  leagueStateMain: {
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
    },

  leagueStateText: {
      minWidth: 0,
      display: 'grid',
      gap: 0.4,
    },

  leagueStateTitle: {
      color: devPlanColors.secondary,
      fontWeight: 700,
      fontSize: 13,
      lineHeight: 1.15,
    },

  leagueStateValue: {
      color: devPlanColors.primaryDark,
      fontSize: 30,
      lineHeight: 1,
      fontWeight: 700,
    },

  leagueStateIcon: {
      width: 42,
      height: 42,
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      color: devPlanColors.primary,
      bgcolor: devPlanColors.primaryLight,
    },

  leagueStateDetails: {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 0.45,
    },

  leagueStateDetail: {
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0.45,
      px: 0.55,
      py: 0.35,
      borderRadius: 7,
      bgcolor: '#f6f9fc',
      border: '1px solid #e4edf6',
      overflow: 'hidden',
    },

  leagueStateDetailLabel: {
      minWidth: 0,
      color: devPlanColors.secondary,
      fontSize: 10.5,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

  leagueStateDetailValue: {
      flexShrink: 0,
      color: devPlanColors.primaryDark,
      fontSize: 12,
      lineHeight: 1,
      fontWeight: 700,
    },

  contentGrid: {
      minWidth: 0,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        xl: 'minmax(0, 1fr) 270px',
      },
      gap: 2,
      alignItems: 'stretch',
      overflow: 'hidden',

      '& > *': {
        minWidth: 0,
        minHeight: 0,
        height: '100%',
      },
    }
}
