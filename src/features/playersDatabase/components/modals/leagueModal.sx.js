// C:\projects\devplan\src\features\playersDatabase\components\modals\leagueModal.sx.js
const palette = {
  muted: '#64717f',
  line: '#d8e0e7',
  slate: '#24313f',
  slateSoft: '#eef2f5',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const leagueModalSx = {
  dialog: {
    width: 'min(860px, calc(100vw - 40px))',
    maxHeight: 'calc(100dvh - 72px)',
    p: { xs: 1.5, md: 2 },
    borderRadius: '10px',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  title: {
    fontWeight: 700,
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
    mt: 0.5,
  },

  clubsField: {
    gridColumn: {
      xs: '1',
      md: '2',
    },
  },

  derived: {
    gridColumn: '1 / -1',
    minHeight: 38,
    px: 1.25,
    py: 0.75,
    borderRadius: '8px',
    bgcolor: palette.slateSoft,
    color: palette.slate,
    display: 'flex',
    alignItems: 'center',
  },

  fieldLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: 700,
    mb: 0.5,
  },

  fieldControl: {
    minHeight: 38,
    borderRadius: '8px',
    fontSize: 13,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    mt: 0.5,
  },

  error: {
    p: 1,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },
}
