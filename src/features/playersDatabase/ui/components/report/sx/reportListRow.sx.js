// features/playersDatabase/ui/components/report/sx/reportListRow.sx.js

export const reportListRowSx = {
  row: {
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: 'minmax(180px, 1.25fr) minmax(280px, 1.6fr) minmax(150px, 0.85fr) minmax(150px, 0.85fr)',
      },
      gap: {
        xs: 0.8,
        md: 1,
      },
      alignItems: 'center',
      p: {
        xs: 1,
        md: 1.1,
      },
      borderRadius: 12,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.surface',
      boxShadow: '0 2px 8px rgba(16, 43, 64, 0.05)',
    },

  identityArea: {
      minWidth: 0,
    },

  statsArea: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
      gap: 0.45,
      minWidth: 0,
    },

  performanceArea: {
      minWidth: 0,
    },
}
