
export const viewSx = {
  root: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
    mt: 2
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  importantGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 0.75,
    minWidth: 0,
  },

  metric: {
    p: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
  },

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

  sectionsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: '1fr 1fr',
    },
    gap: 1,
    minWidth: 0,
  },

  section: {
    p: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    minWidth: 0,
  },

  sectionHeader: {
    display: 'grid',
    gap: 0.15,
    pb: 0.75,
    mb: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  rows: {
    display: 'grid',
    gap: 0.5,
  },

  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 1,
    alignItems: 'center',
    minWidth: 0,
    px: 0.75,
    py: 0.65,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
  },

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

  empty: {
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'grid',
    gap: 0.25,
  },
}
