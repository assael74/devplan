export const squadSimulatorPrintSx = {
  root: {
    //direction: 'rtl',
    width: '210mm',
    minHeight: '297mm',
    bgcolor: '#fff',
    color: '#111827',
    fontFamily: 'Arial, "Noto Sans Hebrew", sans-serif',
    p: '10mm',
    display: 'grid',
    gap: '5mm',
  },

  header: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 2,
    alignItems: 'start',
    borderBottom: '2px solid #111827',
    pb: 1.5,
  },

  titleBlock: {
    display: 'grid',
    gap: 0.5,
  },

  title: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.15,
  },

  subtitle: {
    fontSize: 11,
    color: '#475569',
  },

  brand: {
    display: 'grid',
    justifyItems: 'end',
    gap: 0.25,
    color: '#0f172a',
    fontWeight: 700,
    fontSize: 14,
  },

  section: {
    border: '1px solid #dbe3ef',
    borderRadius: 8,
    overflow: 'hidden',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  sectionHeader: {
    px: 1.5,
    py: 1,
    bgcolor: '#f1f5f9',
    borderBottom: '1px solid #dbe3ef',
    fontSize: 14,
    fontWeight: 700,
  },

  sectionBody: {
    p: 1.5,
  },

  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1,
  },

  metaBox: {
    border: '1px solid #dbe3ef',
    borderRadius: 6,
    p: 1,
    minHeight: 46,
    display: 'grid',
    gap: 0.25,
    bgcolor: '#fbfdff',
  },

  metaLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 700,
  },

  metaValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: 700,
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 1,
  },

  kpiBox: {
    border: '1px solid #dbe3ef',
    borderRadius: 8,
    p: 1.25,
    bgcolor: '#f8fafc',
    boxShadow: 'inset -4px 0 0 #2563eb',
    display: 'grid',
    gap: 0.35,
  },

  kpiLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 700,
  },

  kpiValue: {
    fontSize: 18,
    fontWeight: 900,
    color: '#0f172a',
  },

  kpiSub: {
    fontSize: 10,
    color: '#64748b',
  },

  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1.5,
  },

  list: {
    display: 'grid',
    gap: 0.75,
  },

  summaryRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: 1,
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    p: 0.75,
    bgcolor: '#fff',
  },

  rowTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0f172a',
  },

  rowSub: {
    fontSize: 9,
    color: '#64748b',
  },

  chip: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 46,
    borderRadius: 999,
    px: 0.75,
    py: 0.25,
    fontSize: 10,
    fontWeight: 700,
    bgcolor: '#e0f2fe',
    color: '#075985',
  },

  playerCell: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  playerAvatar: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid #dbe3ef',
    flex: '0 0 auto',
  },

  playerName: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.2,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 10,
    '& th': {
      bgcolor: '#f1f5f9',
      color: '#334155',
      textAlign: 'right',
      fontWeight: 700,
      border: '1px solid #dbe3ef',
      p: 0.75,
    },
    '& td': {
      border: '1px solid #e2e8f0',
      p: 0.65,
      verticalAlign: 'middle',
    },
    '& tbody tr:nth-of-type(even)': {
      bgcolor: '#fbfdff',
    },
  },

  noteBox: {
    border: '1px solid #fed7aa',
    bgcolor: '#fff7ed',
    color: '#9a3412',
    borderRadius: 8,
    p: 1,
    fontSize: 10,
  },
}
