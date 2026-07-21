// features/playersDatabase/ui/pages/teamPage/sx/teamPage.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamPageSx = {
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
      lg: 'minmax(0, 1fr) auto',
    },
    gap: 2,
    alignItems: 'end',
  },

  headerCopy: {
    minWidth: 0,
    gap: 0.75,
    alignItems: 'flex-start',
  },

  pageTitle: {
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
    alignItems: 'center',
    gap: 1.25,
    flexWrap: 'wrap',
  },

  birthYearChip: {
    minHeight: 38,
    px: 1.8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    bgcolor: devPlanColors.tertiary,
    border: `1px solid ${devPlanColors.primary}`,
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 20px rgba(47, 134, 199, 0.24)',
  },

  pageDescription: {
    maxWidth: 760,
    color: devPlanColors.secondary,
    textAlign: 'left',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  headerActionsPanel: {
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
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

  statsSection: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 1.25,
    alignItems: 'stretch',
  },

  statsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: '1.05fr minmax(0, 1.48fr) minmax(0, 1.48fr)',
    },
    gap: 1,

    '& > *': {
      minWidth: 0,
      minHeight: 106,
      maxHeight: 118,
      p: 1.25,
    },

    '& h2': {
      fontSize: 28,
      lineHeight: 1,
    },

    '& [class*="MuiTypography-body-sm"]': {
      fontSize: 13,
      lineHeight: 1.2,
    },

    '& [class*="MuiTypography-body-xs"]': {
      fontSize: 11,
      lineHeight: 1.15,
    },
  },

  teamKpiCard: {
    minWidth: 0,
    minHeight: 106,
    maxHeight: 118,
    p: 1.25,
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    gap: 0.75,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
    overflow: 'hidden',
  },

  teamKpiMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  teamKpiText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.5,
  },

  teamKpiTitle: {
    color: devPlanColors.secondary,
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.15,
  },

  teamKpiValueRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'nowrap',
  },

  teamKpiValue: {
    color: devPlanColors.primaryDark,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 700,
  },

  teamKpiIcon: {
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

  teamKpiDetails: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))',
    gap: 0.5,
  },

  teamKpiDetail: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    px: 0.65,
    py: 0.35,
    borderRadius: 7,
    bgcolor: '#f6f9fc',
    border: '1px solid #e4edf6',
    overflow: 'hidden',
  },

  teamKpiDetailLabel: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 11,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  teamKpiDetailValue: {
    flexShrink: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    lineHeight: 1,
    fontWeight: 700,
  },

  statusPanel: {
    minWidth: 0,
    p: 1.25,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
  },

  statusGrid: {
    display: 'grid',
    gap: 0.6,
    mt: 0.25,
  },

  statusItem: {
    minWidth: 0,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: devPlanColors.primary,
  },

  statusTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  statusItemTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  statusText: {
    color: devPlanColors.secondary,
  }
}
