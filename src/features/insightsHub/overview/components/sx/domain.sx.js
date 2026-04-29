
export const domainSx = {
  root: (item, active) => ({
    borderRadius: 16,
    p: 1.25,
    minHeight: 86,
    display: 'grid',
    gap: 0.75,
    cursor: item.disabled ? 'not-allowed' : 'pointer',
    opacity: item.disabled ? 0.5 : 1,
    bgcolor: active ? 'primary.softBg' : 'background.surface',
    borderColor: active ? 'primary.outlinedBorder' : 'rgba(15,23,42,0.08)',
    boxShadow: active
      ? '0 10px 26px rgba(37,99,235,0.10)'
      : '0 8px 22px rgba(15,23,42,0.035)',
    transition: '160ms ease',
    '&:hover': item.disabled
      ? {}
      : {
          transform: 'translateY(-1px)',
          borderColor: active ? 'primary.outlinedBorder' : 'rgba(37,99,235,0.22)',
          boxShadow: '0 12px 28px rgba(15,23,42,0.07)',
        },
  }),

  wrapRoot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1
  },

  wrapIcon: (active) => ({
    width: 32,
    height: 32,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    bgcolor: active ? 'background.surface' : 'background.level1',
    color: active ? 'primary.solidBg' : 'text.secondary',
    flexShrink: 0,
  }),

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  }
}
