// src/features/playersDatabase/ui/pages/teamPage/sx/teamStatsOverview.sx.js

export const teamStatsOverviewSx = {
  statsSection: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 1.25,
    alignItems: 'stretch',
  },

  kpiRow: {
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
    },
    '& > *': {
      p: 1,
    },

    '& h2': {
      fontSize: 26,
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
}
