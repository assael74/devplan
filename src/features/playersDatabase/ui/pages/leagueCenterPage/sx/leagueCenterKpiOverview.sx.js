// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterKpiOverview.sx.js

export const leagueCenterKpiOverviewSx = {
  kpiGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(3, minmax(0, 1fr))',
      lg: 'repeat(6, minmax(0, 1fr))',
    },
    gap: 1,
  },

  summaryCard: {
    minWidth: 0,
    minHeight: 88,
    p: 1.1,
    borderColor: '#dde6ed',
    boxShadow: '0 3px 10px rgba(16, 43, 64, 0.035)',
    bgcolor: '#fff',
  },
}
