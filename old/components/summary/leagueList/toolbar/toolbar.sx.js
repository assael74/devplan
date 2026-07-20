// features/playersDatabase/components/summary/leagueList/toolbar/toolbar.sx.js

const palette = {
  line: '#d8e0e7',
}

export const toolbarSx = {
  toolbar: {
    flex: '0 0 auto',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'center',
    gap: 0.75,
    p: 0.75,
    borderBottom: `1px solid ${palette.line}`,
  },

  title: {
    fontWeight: 700,
  },

  filters: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: 0.5,
  },

  filterSelect: {
    minWidth: 0,
  },
}
