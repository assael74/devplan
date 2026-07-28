// features/reports/renderers/external/shared/reportList.sx.js

export const reportListSx = {
  toolbar: colors => ({
    borderRadius: 12,
    border: '1px solid',
    borderColor: colors.accent,
    bgcolor: 'transparent',
    overflow: 'visible',
  }),

  toolbarMain: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 39,
    px: { xs: 1, sm: 1.25 },
    py: 0.75,
  },

  toolbarTitle: {
    fontWeight: 700,
    color: 'text.primary',
  },

  toolbarHeaders: {
    display: { xs: 'none', md: 'grid' },
    gridTemplateColumns: 'minmax(180px, 1.25fr) minmax(280px, 1.6fr) minmax(150px, 0.85fr) minmax(150px, 0.85fr)',
    gap: 1,
    alignItems: 'center',
    px: 1.25,
    py: 0.7,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  toolbarHeader: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: 'text.secondary',
  },

  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 0.75,
    px: { xs: 0.25, sm: 0.5 },
    py: 0.75,
    position: 'relative',
    zIndex: 3,
  },

  sortControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    order: 0,
  },

  viewControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0,
    order: 1,
  },

  viewToggle: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.5,
    minWidth: 0,
  },

  viewToggleButton: ({ isActive }) => ({
    minHeight: 28,
    px: { xs: 0.85, sm: 1.15 },
    borderRadius: 999,
    border: '1px solid',
    borderColor: isActive ? '#10B981' : 'divider',
    fontSize: 11,
    fontWeight: 700,
    color: isActive ? '#FFFFFF' : 'text.secondary',
    bgcolor: isActive ? '#10B981' : 'background.surface',
    whiteSpace: 'nowrap',

    '&:hover': {
      bgcolor: isActive ? '#0E9F6E' : 'background.level1',
      borderColor: isActive ? '#0E9F6E' : '#10B981',
    },
  }),

  list: {
    display: 'grid',
    gap: 0.65,
  },

  row: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(180px, 1.25fr) minmax(280px, 1.6fr) minmax(150px, 0.85fr) minmax(150px, 0.85fr)',
    },
    gap: { xs: 0.8, md: 1 },
    alignItems: 'center',
    p: { xs: 1, md: 1.1 },
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    boxShadow: '0 2px 8px rgba(16, 43, 64, 0.05)',
  },

  identityArea: {
    minWidth: 0,
  },

  statsArea: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 0.45,
    minWidth: 0,
  },

  performanceArea: {
    minWidth: 0,
  },

  metric: ({ compact }) => ({
    minWidth: 0,
    textAlign: 'center',
    px: compact ? 0.25 : 0.45,
  }),

  metricLabel: {
    display: 'block',
    fontSize: 9,
    lineHeight: 1.15,
    color: 'text.secondary',
  },

  metricValue: {
    display: 'block',
    mt: 0.2,
    fontSize: 12,
    lineHeight: 1.15,
    fontWeight: 700,
    color: 'text.primary',
  },

  empty: {
    p: 2,
    borderRadius: 12,
    border: '1px dashed',
    borderColor: 'divider',
    textAlign: 'center',
    color: 'text.secondary',
  },
}
