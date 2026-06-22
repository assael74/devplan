// src/features/playersDatabase/components/leagues/board/sx/season.sx.js

const palette = {
  panel: '#ffffff',
  line: '#d8e0e7',
  muted: '#64717f',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const seasonSx = {
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

  list: {
    display: 'grid',
    gap: 0.75,
  },

  item: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1fr) auto',
    },
    gap: 1,
    alignItems: 'center',
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#fbfcfd',
    p: 1,
  },

  title: {
    fontWeight: 700,
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },

  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  add: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1.2fr 1fr 1fr auto',
    },
    gap: 0.75,
    alignItems: 'center',
    mt: 1,
    pt: 1,
    borderTop: `1px solid ${palette.line}`,
  },

  empty: {
    maxWidth: 520,
    color: palette.muted,
    lineHeight: 1.6,
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
