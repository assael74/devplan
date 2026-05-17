// teamProfile/sharedUi/management/sx/view.sx.js

export const viewSx = {
  root: (print) => ({
    display: 'grid',
    gap: print ? 1.25 : 1,
    minWidth: 0,
    mt: print ? 0 : 1,
  }),

  importantGrid: (isMobile, print) => ({
    display: 'grid',
    gridTemplateColumns: print
      ? 'repeat(5, minmax(0, 1fr))'
      : {
          xs: '1fr 1fr',
          sm: 'repeat(3, minmax(0, 1fr))',
          md: 'repeat(5, minmax(0, 1fr))',
        },
    gap: 0.75,
    minWidth: 0,
  }),

  metric: (print) => ({
    p: print ? 0.9 : 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
    bgcolor: print ? '#fff' : undefined,
    breakInside: 'avoid',
  }),

  metricLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    mb: 0.25,
  },

  metricValue: {
    fontWeight: 700,
    lineHeight: 1.2,
  },

  metricHelper: {
    color: 'text.tertiary',
    mt: 0.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  sectionsGrid: (print) => ({
    display: 'grid',
    gridTemplateColumns: print
      ? '1fr 1fr'
      : {
          xs: '1fr',
          xl: '1fr 1fr',
        },
    gap: 1,
    minWidth: 0,
  }),

  section: (print) => ({
    p: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: print ? '#fff' : 'background.surface',
    minWidth: 0,
    breakInside: 'avoid',
  }),

  sectionHeader: {
    display: 'grid',
    gap: 0.15,
    pb: 0.75,
    mb: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  sectionTitle: {
    fontWeight: 700,
  },

  sectionSubtitle: {
    color: 'text.tertiary',
  },

  rows: {
    display: 'grid',
    gap: 0.5,
  },

  row: (print) => ({
    display: 'grid',
    gridTemplateColumns: print
      ? 'minmax(0, 1fr) minmax(160px, auto)'
      : {
          xs: '1fr',
          sm: 'minmax(0, 1fr) auto',
        },
    gap: 0.75,
    alignItems: print ? 'center' : { xs: 'start', sm: 'center' },
    minWidth: 0,
    px: 0.75,
    py: 0.65,
    borderRadius: 'sm',
    bgcolor: print ? '#f8f9fb' : 'background.level1',
  }),

  rowLabel: {
    fontWeight: 700,
  },

  rowHelper: {
    color: 'text.tertiary',
    mt: 0.1,
  },

  rowValue: {
    fontWeight: 700,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  },

  chips: (print) => ({
    display: 'flex',
    gap: 0.5,
    alignItems: 'center',
    justifyContent: print ? 'flex-end' : 'flex-start',
    flexWrap: 'wrap',
    minWidth: 0,
  }),

  chip: {
    fontWeight: 700,
    '--Chip-radius': '8px',

    '& svg': {
      fill: 'currentColor',
    },
  },

  empty: (print) => ({
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: print ? '#fff' : 'background.surface',
    display: 'grid',
    gap: 0.25,
  }),

  emptyTitle: {
    fontWeight: 700,
  },

  emptyText: {
    color: 'text.tertiary',
  },
}
