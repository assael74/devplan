// src/features/playersDatabase/components/page.sx.js

export const pageSx = {
  root: {
    minHeight: 'calc(100vh - 72px)',
    height: {
      xs: 'auto',
      xl: 'calc(100vh - 72px)',
    },
    bgcolor: '#eef2f5',
    color: '#17202a',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 0,
    p: {
      xs: 1,
      md: 1,
    },
    borderRadius: 'sm',
    overflow: {
      xs: 'visible',
      xl: 'hidden',
    },
  },
}
