// ui/forms/ui/teams/sx/create.sx.js

export const createSx = {
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
  }),

  title: {
    mt: 0.5,
    mb: 0.25,
  },

  status: {
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    pt: 3,
  }
}
