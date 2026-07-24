// features/playersDatabase/ui/pages/searchPage/sx/searchPage.sx.js

export const searchPageSx = {
  page: {
    width: '100%',
    maxWidth: 1640,
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    mx: 'auto',
    px: { xs: 2, md: 1.5 },
    py: { xs: 1.5, md: 1 },
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.25,
    overflow: 'hidden',
  },
  workspace: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.25,
    overflow: 'hidden',
  },
  resultsWorkspace: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 300px',
    },
    gap: 1.25,
    overflow: 'hidden',
    '& > *': {
      minWidth: 0,
      minHeight: 0,
    },
  },
}
