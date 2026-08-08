// features/playersDatabase/ui/pages/teamPage/sx/TeamStatsOverview.sx.js

export const teamStatsOverviewSx = {
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
}
