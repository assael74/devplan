const palette = {
  navy: '#111827',
  navy2: '#1f2937',
  blue: '#2563eb',
  blueSoft: '#dbeafe',
  green: '#16a34a',
  greenSoft: '#dcfce7',
  orange: '#d97706',
  orangeSoft: '#ffedd5',
  red: '#dc2626',
  redSoft: '#fee2e2',
  slate: '#475569',
  slateSoft: '#f1f5f9',
  border: '#d8dee9',
}

const toneMap = {
  blue: { line: palette.blue, bg: '#eff6ff', text: '#1d4ed8' },
  green: { line: palette.green, bg: '#f0fdf4', text: '#15803d' },
  orange: { line: palette.orange, bg: '#fff7ed', text: '#b45309' },
  slate: { line: palette.slate, bg: palette.slateSoft, text: '#334155' },
  success: { line: palette.green, bg: palette.greenSoft, text: '#166534' },
  warning: { line: palette.orange, bg: palette.orangeSoft, text: '#9a3412' },
  danger: { line: palette.red, bg: palette.redSoft, text: '#991b1b' },
  neutral: { line: palette.slate, bg: palette.slateSoft, text: '#334155' },
  primary: { line: palette.blue, bg: palette.blueSoft, text: '#1e40af' },
}

const tone = value => toneMap[value] || toneMap.neutral

export const squadSimulatorPrintSx = {
  root: {
    width: '210mm',
    minHeight: '297mm',
    bgcolor: '#ffffff',
    color: palette.navy,
    fontFamily: 'Arial, "Noto Sans Hebrew", sans-serif',
    p: '9mm',
    display: 'grid',
    gap: '4mm',
  },

  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 72mm',
    gap: 2,
    alignItems: 'stretch',
    p: 2,
    borderRadius: 12,
    bgcolor: palette.navy,
    color: '#ffffff',
    boxShadow: 'inset 0 -4px 0 #f59e0b',
    breakInside: 'avoid',
  },

  heroText: {
    display: 'grid',
    gap: 0.35,
    alignContent: 'center',
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: 800,
    color: '#fbbf24',
    letterSpacing: 0,
  },

  title: {
    fontSize: 25,
    fontWeight: 900,
    lineHeight: 1.12,
    color: '#ffffff',
  },

  subtitle: {
    fontSize: 11,
    color: '#cbd5e1',
  },

  heroMeta: {
    display: 'grid',
    gap: 0.75,
  },

  contextBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1,
    breakInside: 'avoid',
  },

  highlightPill: {
    bgcolor: 'rgba(255,255,255,0.92)',
    color: palette.navy,
    borderRadius: 9,
    border: '1px solid rgba(255,255,255,0.35)',
    p: 1,
    display: 'grid',
    gap: 0.2,
    minHeight: 42,
    boxShadow: '0 1px 0 rgba(15, 23, 42, 0.08)',
  },

  highlightLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: palette.slate,
  },

  highlightValue: {
    fontSize: 14,
    fontWeight: 900,
    color: palette.navy,
    lineHeight: 1.15,
  },

  section: {
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    overflow: 'hidden',
    bgcolor: '#ffffff',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1.25,
    py: 0.85,
    bgcolor: palette.slateSoft,
    borderBottom: `1px solid ${palette.border}`,
  },

  sectionNumber: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: palette.navy,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 900,
    flexShrink: 0,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: palette.navy,
  },

  sectionBody: {
    p: 1.25,
  },

  sectionBodyDense: {
    p: 1,
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: '.8fr 1.5fr .8fr .8fr',
    gap: 1,
  },

  kpiBox: toneName => ({
    border: `1px solid ${tone(toneName).line}`,
    borderRadius: 10,
    p: 1.2,
    bgcolor: tone(toneName).bg,
    boxShadow: `inset 5px 0 0 ${tone(toneName).line}`,
    display: 'grid',
    gap: 0.35,
    minHeight: 72,
  }),

  kpiLabel: {
    fontSize: 10,
    color: palette.slate,
    fontWeight: 800,
  },

  kpiValue: {
    fontSize: 21,
    fontWeight: 900,
    color: palette.navy,
    lineHeight: 1,
  },

  kpiSub: {
    fontSize: 9.5,
    color: palette.slate,
  },

  confidenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 0.75,
  },

  confidenceCard: toneName => ({
    display: 'grid',
    gap: 0.6,
    p: 0.85,
    borderRadius: 9,
    border: `1px solid ${tone(toneName).line}`,
    bgcolor: tone(toneName).bg,
    minHeight: 70,
  }),

  confidenceTitle: {
    fontSize: 10,
    fontWeight: 900,
    color: palette.navy,
    lineHeight: 1.15,
  },

  confidenceNumbers: {
    display: 'grid',
    gap: 0.15,
  },

  confidenceValue: {
    fontSize: 16,
    fontWeight: 900,
    color: palette.navy,
    lineHeight: 1,
  },

  confidenceSub: {
    fontSize: 8.8,
    color: palette.slate,
  },

  positionGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.65,
  },

  positionChip: status => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.55,
    borderRadius: 999,
    border: `1px solid ${tone(status).line}`,
    bgcolor: tone(status).bg,
    color: tone(status).text,
    px: 1,
    py: 0.45,
    minWidth: 64,
    justifyContent: 'center',
  }),

  positionCode: {
    fontSize: 11,
    fontWeight: 900,
  },

  positionCount: {
    fontSize: 10,
    fontWeight: 800,
  },

  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1.25,
  },

  list: {
    display: 'grid',
    gap: 0.65,
  },

  distributionRow: status => ({
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: 0.75,
    alignItems: 'center',
    border: `1px solid ${tone(status).line}`,
    borderRadius: 8,
    p: 0.7,
    bgcolor: '#ffffff',
  }),

  distributionMain: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  rowTitle: {
    fontSize: 11,
    fontWeight: 900,
    color: palette.navy,
  },

  rowSub: {
    fontSize: 9,
    color: palette.slate,
  },

  countChip: status => ({
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    borderRadius: 999,
    px: 0.75,
    py: 0.25,
    fontSize: 10,
    fontWeight: 900,
    bgcolor: tone(status).bg,
    color: tone(status).text,
  }),

  valueChip: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 62,
    borderRadius: 999,
    px: 0.75,
    py: 0.25,
    fontSize: 9.5,
    fontWeight: 800,
    bgcolor: palette.slateSoft,
    color: palette.navy2,
  },

  tableSection: {
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    overflow: 'hidden',
    bgcolor: '#ffffff',
    breakBefore: 'page',
    pageBreakBefore: 'always',
  },

  playerCell: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
  },

  playerAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    objectFit: 'cover',
    border: `1px solid ${palette.border}`,
    flex: '0 0 auto',
  },

  playerName: {
    fontSize: 10,
    fontWeight: 900,
    color: palette.navy,
    lineHeight: 1.2,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 10,
    '& th': {
      bgcolor: palette.navy,
      color: '#ffffff',
      textAlign: 'right',
      fontWeight: 900,
      border: `1px solid ${palette.navy2}`,
      p: 0.7,
      whiteSpace: 'nowrap',
    },
    '& td': {
      border: `1px solid ${palette.border}`,
      p: 0.6,
      verticalAlign: 'middle',
    },
    '& tbody tr:nth-of-type(even)': {
      bgcolor: '#f8fafc',
    },
    '& td:first-of-type, & th:first-of-type': {
      textAlign: 'center',
      width: 28,
    },
  },
}
