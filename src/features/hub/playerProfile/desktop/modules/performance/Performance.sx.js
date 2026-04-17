// Performance.sx.js

export const perfModuleSx = {
  root: { display: 'grid', gap: 1.25 },

  topActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 1,
  },

  statsOnlyLabel: { opacity: 0.75 },

  gamesGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    alignItems: 'start',
  },

  panel: {
    variant: 'outlined',
    sx: {
      p: 1,
      borderRadius: 'md',
      bgcolor: 'background.surface',
      borderColor: 'divider',
    },
  },

  panelHeaderRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    mb: 0.75,
  },

  panelCounter: { opacity: 0.65 },

  divider: { my: 0.25 },

  statsPanel: {
    variant: 'outlined',
    sx: {
      p: 1,
      borderRadius: 'md',
      bgcolor: 'background.surface',
      borderColor: 'divider',
    },
  },

  statsHeaderRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 },
}

export const perfStatsSx = {
  root: { display: 'grid', gap: 1 },

  topBar: {
    p: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  topChipsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  topChipsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  topChipsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  kpiChip: {
    borderRadius: '999px',
    px: 1,
    py: 0.45,
    minHeight: 28,
    gap: 0.6,
    '& .MuiChip-label': {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 0.6,
    },
    lineHeight: 1.1,
  },

  kpiLabel: { opacity: 0.65, lineHeight: 1 },
  kpiValue: { fontWeight: 700, lineHeight: 1 },

  grid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))',
    '@media (max-width: 950px)': { gridTemplateColumns: '1fr' },
  },

  statCard: {
    p: 0.9,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minHeight: 52,
    borderColor: 'divider',
    '&:hover': {
      bgcolor: 'success.softBg',
      borderColor: 'success.300',
      boxShadow: 'sm',
    },
  },

  statLeft: { display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 },
  statLabel: { opacity: 0.75 },
  statRight: { display: 'flex', alignItems: 'baseline', gap: 0.75, flexShrink: 0 },
  statValue: { fontWeight: 700, lineHeight: 1 },
  statSub: { opacity: 0.7, lineHeight: 1 },
}

export const timelineSx = {
  list: { display: 'grid', gap: 0.5 },

  card: (accentColor, hoverBg) => ({
    p: 0.85,
    borderRadius: 'md',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    transition: '0.12s',
    borderRightColor: accentColor || 'transparent',
    '&:hover': {
      bgcolor: hoverBg || 'background.level1',
      boxShadow: 'md',
    },
  }),

  header: { display: 'flex', alignItems: 'flex-start', gap: 1 },

  chipsRow: { display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.6 },
}
