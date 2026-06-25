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
    mb: 0,
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    boxShadow: '0 12px 32px rgba(22, 34, 51, 0.07)',
    overflow: 'hidden',
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
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
    p: 0.75,
    gap: 0.75,
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
    minHeight: 0,
    height: '100%',
  },

  panelTop: {
    px: 1,
    py: 0.65,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'auto minmax(0, 1fr)',
    },
    gap: 0.6,
    alignItems: 'center',
    borderBottom: `1px solid ${palette.line}`,

    '& button': {
      minHeight: 32,
      borderRadius: '8px',
    },
  },

  openLeagueButton: {
    minWidth: 140,
    px: 1.1,
    justifySelf: {
      xs: 'stretch',
      lg: 'end',
    },
    fontWeight: 700,
    boxShadow: '0 6px 14px rgba(9, 105, 218, 0.14)',
  },

  panelTitle: {
    fontWeight: 700,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.4,
    alignItems: 'center',

    '& .MuiChip-root': {
      minHeight: 24,
      fontSize: 11,
      fontWeight: 700,
      maxWidth: 220,
    },
  },

  content: {
    overflow: 'hidden',
    minHeight: 0,
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
    display: 'grid',
    p: 0.65,
    bgcolor: '#f4f7fb',
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
    gap: 0.45,
    minHeight: '100%',
    alignItems: 'stretch',
  },

  mainColumn: {
    minWidth: 0,
    width: '100%',
    justifySelf: 'stretch',
    alignSelf: 'stretch',
    display: 'grid',
    gap: 0,
    minHeight: '100%',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
}
