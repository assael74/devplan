// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueKpiOverview.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueKpiOverviewSx = {
  kpiRow: {
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1.25,
  },

  summaryDetails: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0.45,
  },

  summaryDetail: {
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

  summaryDetailLabel: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 10.5,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  summaryDetailValue: {
    flexShrink: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    lineHeight: 1,
    fontWeight: 700,
  },
}
