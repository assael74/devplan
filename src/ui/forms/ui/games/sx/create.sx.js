// ui/forms/ui/games/sx/create.sx.js

export const createSx = {
  root: (layout) => ({
    display: 'grid',
    gap: layout?.shellGap || 1,
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
  root: {
    display: 'grid',
    gap: 1,
    height: '100%',
    minWidth: 0,
  },

  fieldsBlock: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
    minWidth: 0,
  },

  booleanGrid: (layout) => ({
    display: 'grid',
    gridTemplateColumns: layout?.booleanGrid || { xs: '1fr', md: '1fr 1fr' },
    gap: 1,
    minWidth: 0,
  }),

  statsGrid: (layout) => ({
    display: 'grid',
    gridTemplateColumns:
      layout?.statsGrid || { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
    gap: 1,
    pt: 2,
    minWidth: 0,
  }),
}
