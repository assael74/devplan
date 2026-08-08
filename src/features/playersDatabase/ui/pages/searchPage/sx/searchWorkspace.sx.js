// features/playersDatabase/ui/pages/searchPage/sx/SearchWorkspace.sx.js

export const searchWorkspaceSx = {
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
        xl: 'minmax(0, 1fr) 240px',
      },
      gap: 1.25,
      overflow: 'hidden',
      '& > *': {
        minWidth: 0,
        minHeight: 0,
      },
    },
}
