// src/features/playersDatabase/components/leagues/board/sx/detail.sx.js

const palette = {
  detailPanel: '#fbfdff',
  detailSoft: '#f1f6fb',
  blueLine: '#c7d9ec',
  ink: '#17202a',
  muted: '#64717f',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const detailSx = {
  panel: {
    bgcolor: palette.detailPanel,
    border: `1px solid ${palette.blueLine}`,
    borderRadius: '8px',
    p: 0.75,
    minWidth: 0,
    minHeight: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    mb: 0.65,
  },

  title: {
    fontWeight: 700,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    flexShrink: 0,
  },

  openLeagueButton: {
    minWidth: 136,
    px: 1,
    fontWeight: 700,
  },

  editButton: {
    minWidth: 64,
    px: 0.9,
    fontWeight: 700,
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
    gap: 0.65,
  },

  infoItem: {
    minWidth: 0,
    minHeight: 46,
    px: 0.75,
    py: 0.65,
    border: `1px solid ${palette.blueLine}`,
    borderRadius: '7px',
    bgcolor: palette.detailSoft,
  },

  label: {
    mb: 0.25,
    color: palette.muted,
    fontSize: 11,
    fontWeight: 700,
  },

  value: {
    color: palette.ink,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  valueLink: {
    display: 'inline-block',
    maxWidth: '100%',
    color: '#075fc5',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textDecoration: 'none',

    '&:hover': {
      textDecoration: 'underline',
    },
  },

  error: {
    mt: 1,
    p: 0.85,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },

  embeddedSection: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    mt: 0.75,
    pt: 0.75,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderTop: `1px solid ${palette.blueLine}`,
  },
}
