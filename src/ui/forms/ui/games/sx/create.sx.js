// ui/forms/ui/games/sx/create.sx.js

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

export const entrySx = {
  fieldsBlock: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  booleanGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: 1,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
    gap: 1,
    pt: 2,
  },
}
