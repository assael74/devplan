// src/features/playersDatabase/components/leagues/board/sx/detail.sx.js

const palette = {
  panel: '#ffffff',
  line: '#d8e0e7',
  ink: '#17202a',
  muted: '#64717f',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const detailSx = {
  panel: {
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    p: 1.25,
    minWidth: 0,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    mb: 1,
  },

  title: {
    fontWeight: 700,
  },

  actions: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  editGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },

  infoItem: {
    minHeight: 58,
    borderRadius: '8px',
    border: `1px solid ${palette.line}`,
    bgcolor: '#fbfcfd',
    p: 1,
    minWidth: 0,
  },

  label: {
    color: palette.muted,
    fontWeight: 700,
    mb: 0.45,
  },

  value: {
    color: palette.ink,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  error: {
    mt: 1,
    p: 0.85,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },
}
