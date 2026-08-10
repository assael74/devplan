// src/features/playersDatabase/ui/components/page/sx/pageCoreLayout.sx.js

export const pageCoreLayoutSx = {
  page: {
    width: '100%',
    maxWidth: 1560,
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    mx: 'auto',
    px: {
      xs: 2,
      md: 1.5,
    },
    py: {
      xs: 1.5,
      md: 1,
    },
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.5,
    overflow: 'hidden',
  },

  contentGrid: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 270px',
    },
    gap: 1.25,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
    },
  },

  mainColumn: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.25,
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
    },
  },
}
