export const boxPanelProps = {
  sx: {
    width: '90%',
    px: { xs: 1, sm: 2 },
    py: 2,
    mx: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    height: '90vh',
    minHeight: 0,
    overflowY: 'auto',
    scrollbarGutter: 'stable both-edges',
    '&::-webkit-scrollbar': { width: 3 },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--joy-palette-neutral-400)',
      borderRadius: 8,
    },
    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  }
}
