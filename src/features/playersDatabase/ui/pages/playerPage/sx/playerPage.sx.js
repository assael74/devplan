// features/playersDatabase/ui/pages/playerPage/sx/playerPage.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerPageSx = {
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
    alignItems: 'stretch',
  },

  headerCopy: {
    minWidth: 0,
    height: '100%',
    gap: 0.75,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    flexWrap: 'wrap',
  },

  playerAvatar: {
    width: {
      xs: 58,
      md: 68,
    },
    height: {
      xs: 58,
      md: 68,
    },
    display: 'block',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `3px solid ${devPlanColors.primaryLight}`,
    boxShadow: '0 5px 14px rgba(16, 43, 64, 0.12)',
  },

  pageTitle: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 34,
      md: 44,
    },
    lineHeight: 1.05,
    fontWeight: 700,
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

  headerActionsPanel: {
    height: '100%',
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
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

    '&:disabled': {
      bgcolor: '#f4f7fa',
      borderColor: '#d6e0ea',
      color: '#96a4b1',
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
      lg: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },

  playerKpiCard: {
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

  playerKpiMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  playerKpiText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.5,
  },

  playerKpiTitle: {
    color: devPlanColors.secondary,
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.15,
  },

  playerKpiValue: {
    color: devPlanColors.primaryDark,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 700,
  },

  placeholderValue: {
    color: devPlanColors.secondary,
  },

  playerKpiIcon: {
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

  playerKpiDetails: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  playerKpiDetail: {
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

  playerKpiDetailLabel: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 11,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  playerKpiDetailValue: {
    flexShrink: 0,
    maxWidth: '62%',
    color: devPlanColors.primaryDark,
    fontSize: 12,
    lineHeight: 1,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
