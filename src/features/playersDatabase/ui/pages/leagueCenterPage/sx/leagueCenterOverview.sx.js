// features/playersDatabase/ui/pages/leagueCenterPage/sx/LeagueCenterOverview.sx.js

export const leagueCenterOverviewSx = {
  statsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1,

    '& > *': {
      minWidth: 0,
      minHeight: 88,
      p: 1.1,
    },
  },

  summaryCard: {
    borderColor: '#dde6ed',
    boxShadow: '0 3px 10px rgba(16, 43, 64, 0.035)',
    bgcolor: '#fff',
  },
}
