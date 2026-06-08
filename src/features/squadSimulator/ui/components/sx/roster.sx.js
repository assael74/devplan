// src/features/squadSimulator/ui/components/sx/roster.sx.js

export const rosterSx = {
  rosterPanel: {
    maxHeight: { xs: 'none', xl: 'calc(100vh - 250px)' },
    minHeight: { xl: 0 },
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'minmax(0, .6fr) minmax(0, .6fr) minmax(0, .9fr) minmax(0, .55fr) minmax(0, 1.3fr)',
    },
    gap: 1,
    p: 1,
  },

  metric: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    p: 1,
    bgcolor: '#f8fafc',
    minHeight: 54,
    display: 'grid',
    alignContent: 'start',
    justifyItems: 'start',
    textAlign: 'right',
    gap: 0.25,
    boxShadow: 'inset -4px 0 0 var(--metric-accent, #94a3b8)',
  },

  positionKpiChips: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.5,
    mt: 0.25,
  },

  positionKpiChip: {
    minHeight: 22,
    gap: 0.9,
    fontSize: 11,
    border: '1px solid',
    borderColor: 'divider',
    '& strong': {
      fontWeight: 700,
    },
  },

  playerRows: {
    p: '0 12px 12px',
    display: 'grid',
    gap: 0.75,
    minHeight: 0,
    overflowY: { xs: 'visible', xl: 'auto' },
    scrollbarGutter: 'stable',
  },

  playerHeaderRow: {
    display: { xs: 'none', md: 'grid' },
    gridTemplateColumns:
      'minmax(100px, .9fr) minmax(122px, .78fr) minmax(124px, .82fr) minmax(136px, .88fr) minmax(52px, .32fr) repeat(3, minmax(66px, .38fr)) 38px',
    gap: 1,
    px: 1.25,
    pt: 0.5,
    pb: 0.25,
    color: 'text.tertiary',
    fontSize: 12,
    fontWeight: 700,
  },

  playerRow: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(100px, .9fr) minmax(122px, .78fr) minmax(124px, .82fr) minmax(136px, .88fr) minmax(52px, .32fr) repeat(3, minmax(66px, .38fr)) 38px',
    },
    gap: 1,
    alignItems: 'center',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    p: 1,
    bgcolor: '#fbfdff',
  },

  iconChip: {
    justifyContent: 'center',
    '& .MuiChip-startDecorator': {
      ml: 0.5,
      mr: 0,
    },
  },
}
