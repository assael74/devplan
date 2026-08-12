// src/features/playersDatabase/ui/pages/playerPage/sx/playerKpiOverview.sx.js

export const playerKpiOverviewSx = {
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
      lg: 'repeat(4, minmax(0, 1fr))',
    },
  },
}
