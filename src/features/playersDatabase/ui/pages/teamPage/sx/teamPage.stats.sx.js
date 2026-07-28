// features/playersDatabase/ui/pages/teamPage/sx/teamPage.stats.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamPageStatsSx = {
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
    alignItems: 'stretch',

    '& > *': {
      minWidth: 0,
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
    minHeight: 118,
    p: 1.25,
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    gap: 0.75,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
    overflow: 'hidden',
  },

  teamKpiPerformanceCard: {
    minHeight: 142,
    gridTemplateRows: 'auto auto',
    gap: 0.75,
  },

  teamKpiMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  teamKpiPerformanceMain: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.7fr) minmax(92px, 0.72fr) auto',
    alignItems: 'center',
    gap: 0.9,
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

  teamKpiPrimaryDetails: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 0.45,
  },

  teamKpiPrimaryDetail: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    px: 0.7,
    py: 0.45,
    borderRadius: 7,
    bgcolor: '#f6f9fc',
    border: '1px solid #e4edf6',
    overflow: 'hidden',
  },

  teamKpiDetails: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))',
    gap: 0.5,
  },

  teamKpiPerformanceDetails: {
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    pt: 0.7,
    borderTop: '1px solid #e4edf6',
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
}
