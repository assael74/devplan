// features/playersDatabase/components/summary/sx/summaryBoard.sx.js

const palette = {
  panel: '#ffffff',
  line: '#d8e0e7',
  muted: '#64717f',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const summaryBoardSx = {
  root: {
    mb: 0,
    bgcolor: 'transparent',
    border: 0,
    borderRadius: 0,
    boxShadow: 'none',
    overflow: 'hidden',
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    p: 0,
  },

  error: {
    mt: 1,
    mx: 1.5,
    p: 1,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },

  empty: {
    minHeight: {
      xs: 260,
      xl: 'calc(100vh - 330px)',
    },
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    gap: 1,
    p: 3,
    textAlign: 'center',
    bgcolor: '#fbfcfd',
  },

  emptyTitle: {
    fontWeight: 700,
  },

  emptyText: {
    maxWidth: 520,
    color: palette.muted,
    lineHeight: 1.6,
  },

  stage: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: '400px minmax(0, 1fr)',
    },
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
    p: 0.65,
    gap: 0.65,
    bgcolor: 'transparent',
  },

  grid: {
    display: 'grid',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 280px',
    },
    gap: 0.6,
    minHeight: '100%',
    alignItems: 'stretch',
    pt: 0.15,
  },
}
