// features/playersDatabase/ui/components/report/sx/reportListToolbar.sx.js

export const reportListToolbarSx = {
  toolbar: colors => ({
      borderRadius: 12,
      border: '1px solid',
      borderColor: colors.accent,
      bgcolor: 'transparent',
      overflow: 'visible',
    }),

  toolbarMain: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 39,
      px: {
        xs: 1,
        sm: 1.25,
      },
      py: 0.75,
    },

  toolbarTitle: {
      fontWeight: 700,
      color: 'text.primary',
    },

  toolbarHeaders: {
      display: {
        xs: 'none',
        md: 'grid',
      },
      gridTemplateColumns: 'minmax(180px, 1.25fr) minmax(280px, 1.6fr) minmax(150px, 0.85fr) minmax(150px, 0.85fr)',
      gap: 1,
      alignItems: 'center',
      px: 1.25,
      py: 0.7,
      borderTop: '1px solid',
      borderColor: 'divider',
    },

  toolbarHeader: {
      textAlign: 'center',
      fontSize: 11,
      fontWeight: 700,
      color: 'text.secondary',
    },
}
