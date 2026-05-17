// teamProfile/sharedUi/management/print/print.sx.js

export const printSx = {
  page: {
    width: '100%',
    p: 3,
    bgcolor: '#fff',
    color: '#111827',
    display: 'grid',
    gap: 1.5,

    '@media print': {
      p: 0,
    },
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 2,
    pb: 1.5,
    borderBottom: '2px solid #111827',
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.15,
  },

  subtitle: {
    color: '#4b5563',
    mt: 0.5,
  },

  metaGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 0.75,
},

teamMetaItem: {
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  p: 1,
  bgcolor: '#f9fafb',
  display: 'flex',
  alignItems: 'center',
  gap: 0.85,
  minWidth: 0,
},

teamMetaAvatar: {
  width: 38,
  height: 38,
  border: '1px solid #e5e7eb',
  bgcolor: '#fff',
  flexShrink: 0,
},

headerAvatar: {
  width: 54,
  height: 54,
  border: '1px solid #d1d5db',
  bgcolor: '#fff',
  boxShadow: 'sm',
},

  headerBadge: {
    border: '1px solid #d1d5db',
    borderRadius: 10,
    px: 1.25,
    py: 0.85,
    minWidth: 120,
    textAlign: 'center',
  },

  headerBadgeLabel: {
    color: '#6b7280',
    fontWeight: 700,
  },

  headerBadgeValue: {
    fontWeight: 700,
  },

  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0.75,
  },

  metaItem: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    p: 1,
    bgcolor: '#f9fafb',
  },

  metaLabel: {
    color: '#6b7280',
    fontWeight: 700,
  },

  metaValue: {
    fontWeight: 700,
  },

  targetPositionCard: {
    p: 1.4,
    borderRadius: 12,
    border: '1px solid #c7d2fe',
    bgcolor: '#eef2ff',
    display: 'grid',
    gap: 0.35,
  },

  targetPositionLabel: {
    color: '#4338ca',
    fontWeight: 700,
  },

  targetPositionValue: {
    fontWeight: 700,
    color: '#1e1b4b',
    lineHeight: 1.1,
  },

  targetPositionHelper: {
    color: '#4b5563',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 0.75,
  },

  metricCard: {
    p: 1,
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    bgcolor: '#fff',
    breakInside: 'avoid',
  },

  metricLabel: {
    color: '#6b7280',
    fontWeight: 700,
  },

  metricValue: {
    fontWeight: 700,
    mt: 0.2,
  },

  metricHelper: {
    color: '#6b7280',
    mt: 0.25,
  },

  sectionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
    alignItems: 'start',
  },

  section: {
    borderRadius: 12,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    breakInside: 'avoid',
    bgcolor: '#fff',
  },

  sectionHeader: (tone) => ({
    p: 0.95,
    borderBottom: '1px solid',
    borderColor: tone.border,
    bgcolor: tone.bg,
  }),

  sectionTitle: (tone) => ({
    fontWeight: 700,
    color: tone.text,
    lineHeight: 1.2,
  }),

  sectionSubtitle: (tone) => ({
    color: tone.text,
    opacity: 0.85,
    mt: 0.2,
  }),

  rows: {
    display: 'grid',
    gap: 0.5,
    p: 0.9,
  },

  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 1,
    alignItems: 'center',
    minWidth: 0,
    px: 0.8,
    py: 0.7,
    borderRadius: 10,
    bgcolor: '#f8fafc',
    border: '1px solid #edf2f7',
  },

  rowLabel: {
    fontWeight: 700,
    color: '#111827',
  },

  rowHelper: {
    color: '#6b7280',
    mt: 0.15,
  },

  rowValue: {
    fontWeight: 700,
    color: '#111827',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
}
