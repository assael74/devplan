export const statusSx = {
  value: (opt) => ({
    bgcolor: opt.color || 'neutral.softBg',
    color: opt.icCol || 'text.primary',
    gap: 0.5,
    maxWidth: '100%',
  }),

  row: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}
