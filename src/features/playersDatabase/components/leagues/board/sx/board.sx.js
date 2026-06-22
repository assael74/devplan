// src/features/playersDatabase/components/leagues/board/sx/board.sx.js

const palette = {
  panel: '#ffffff',
  line: '#d8e0e7',
  muted: '#64717f',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const boardSx = {
  root: {
    mb: 1.5,
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '10px',
    boxShadow: '0 12px 32px rgba(22, 34, 51, 0.07)',
    overflow: 'hidden',
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
      xl: '280px minmax(0, 1fr)',
    },
    minHeight: 0,
    p: 1,
    gap: 1,
    bgcolor: '#f6f8fa',
  },

  panel: {
    minWidth: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    overflow: 'hidden',
    minHeight: {
      xs: 460,
      xl: 'calc(100vh - 280px)',
    },
  },

  panelTop: {
    p: 1.5,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'auto minmax(0, 1fr) auto',
    },
    gap: 1,
    alignItems: 'center',
    borderBottom: `1px solid ${palette.line}`,
  },

  panelTitle: {
    fontWeight: 700,
  },

  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
  },

  content: {
    overflow: 'auto',
    minHeight: {
      xs: 410,
      xl: 'calc(100vh - 340px)',
    },
    p: 1,
    bgcolor: palette.panel,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) minmax(360px, 0.78fr)',
    },
    gap: 1,
  },
}
