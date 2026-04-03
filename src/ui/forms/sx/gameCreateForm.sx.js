export const gcfSx = {
  root: (layout) => ({
    display: 'grid',
    gap: layout.shellGap,
    minWidth: 0,
  }),

  block: (cols, gap = 2) => ({
    display: 'grid',
    gap,
    gridTemplateColumns: cols,
    minWidth: 0,
    alignItems: 'start',
    '& > *': {
      minWidth: 0,
      width: '100%',
    },
  }),

  title: {
    mt: 0.5,
    mb: 0.25,
  },
}
