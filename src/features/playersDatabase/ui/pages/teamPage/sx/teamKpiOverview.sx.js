// src/features/playersDatabase/ui/pages/teamPage/sx/teamKpiOverview.sx.js

export const teamKpiOverviewSx = {
  kpiSection: {
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
  },
}
