

export const weekToolbarSx = {
  root: {
    p: 1,
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'xs',
  },

  main: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    flex: 1,
  },

  accent: {
    width: 8,
    height: 8,
    borderRadius: 999,
    bgcolor: 'success.500',
    flexShrink: 0,
  },

  title: {
    fontWeight: 700,
  },

  subtitle: {
    color: 'text.tertiary',
  },

  countChip: {
    fontWeight: 700,
  },
}
