// src/features/playersDatabase/components/leagues/sx/page.sx.js

const palette = {
  panel: '#ffffff',
  line: '#d8e0e7',
  muted: '#64717f',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const pageSx = {
  root: {
    mb: 1.5,
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '10px',
    boxShadow: '0 12px 32px rgba(22, 34, 51, 0.07)',
    overflow: 'hidden',
  },

  top: {
    py: 0.5,
    px: 1,
    borderBottom: `1px solid ${palette.line}`,
    display: 'flex',
    flexDirection: {
      xs: 'column',
      lg: 'row',
    },
    justifyContent: 'space-between',
    alignItems: {
      xs: 'stretch',
      lg: 'center',
    },
    gap: 1.5,
  },

  title: {
    fontWeight: 700,
    fontSize: 22
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },

  controls: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: {
      xs: 'space-between',
      lg: 'flex-start',
    },
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

  body: {
    p: 1,
    bgcolor: '#f6f8fa',
    minHeight: {
      xs: 260,
      xl: 'calc(100vh - 300px)',
    },
  },

  metaBar: {
    p: 1.5,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 1,
    alignItems: 'center',
    border: `1px solid ${palette.line}`,
    borderBottom: 0,
    borderRadius: '8px 8px 0 0',
    bgcolor: palette.panel,
  },

  sectionTitle: {
    fontWeight: 700,
  },

  leagueInfo: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.6,
  },

  birthChip: {
    fontWeight: 700,
    border: '1px solid #f4c36a',
  },
}
