// features/playersDatabase/ui/components/report/sx/reportViewToggle.sx.js

export const reportViewToggleSx = {
  viewToggle: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 0.5,
      minWidth: 0,
    },

  viewToggleButton: ({ isActive }) => ({
      minHeight: 28,
      px: {
        xs: 0.85,
        sm: 1.15,
      },
      borderRadius: 999,
      border: '1px solid',
      borderColor: isActive ? '#10B981' : 'divider',
      fontSize: 11,
      fontWeight: 700,
      color: isActive ? '#FFFFFF' : 'text.secondary',
      bgcolor: isActive ? '#10B981' : 'background.surface',
      whiteSpace: 'nowrap',

      '&:hover': {
        bgcolor: isActive ? '#0E9F6E' : 'background.level1',
        borderColor: isActive ? '#0E9F6E' : '#10B981',
      },
    }),
}
