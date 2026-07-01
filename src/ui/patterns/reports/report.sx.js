export const shellSx = ({ systemColors, printPages = 1 }) => ({
  root: {
    '--report-system': systemColors.primary,
    '--report-system-dark': systemColors.primaryDark,
    '--report-system-soft': systemColors.primaryLight,
    '--report-surface': systemColors.surface,
    '--report-border': systemColors.border,
    '--report-text': systemColors.text,
    '--report-subtext': systemColors.subText,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: 'min(1120px, calc(100% - 32px))',
    minHeight: '100vh',
    mx: 'auto',
    my: 4,
    bgcolor: 'var(--report-surface)',
    color: 'var(--report-text)',
    border: '1px solid var(--report-border)',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(23, 32, 51, 0.08)',
    overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', inset: '0 0 auto', height: 4, bgcolor: 'var(--report-system)', zIndex: 2 },
    '@media (max-width: 820px)': { width: 'calc(100% - 16px)', my: 1, borderRadius: '15px', '&::before': { height: 3 } },
    '@media print': { width: '100%', minHeight: `calc(${printPages} * 100vh)`, m: 0, border: 0, borderRadius: 0, boxShadow: 'none' },
  },

  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    px: 3,
    py: 1.75,
    bgcolor: '#F4F8FA',
    borderBottom: '1px solid var(--report-border)',
    '@media (max-width: 820px)': { px: 1.75, py: 1.25 },
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25
  },

  brandMark: {
    display: 'grid',
    placeItems: 'center',
    width: 38,
    height: 38,
    borderRadius: '11px',
    bgcolor: 'var(--report-system)',
    color: '#FFFFFF',
    fontWeight: 700,
    boxShadow: '0 6px 16px rgba(23, 59, 87, 0.2)',
    '@media (max-width: 820px)': { width: 34, height: 34 },
  },

  brandCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.125
  },

  brandName: {
    fontSize: 15,
    fontWeight: 700
  },

  brandSubtitle: {
    color: 'var(--report-subtext)',
    fontSize: 11,
    fontWeight: 700,
    '@media (max-width: 820px)': { display: 'none' }
  },

  header: {
    px: 3,
    pt: 2.75,
    pb: 1.5,
    '@media (max-width: 820px)': { px: 1.75, pt: 1.75, pb: 1.25 },
  },

  mainRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2.5,
    mb: 1.5,
    '@media (max-width: 820px)': { mb: 1.25 },
  },

  title: {
    m: 0,
    color: 'var(--report-system-dark)',
    fontSize: 'clamp(26px, 4vw, 38px)',
    lineHeight: 1.12,
    fontWeight: 700,
    '@media (max-width: 820px)': { fontSize: 35 },
  },

  date: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 195,
    px: 1.875,
    py: 1.625,
    bgcolor: '#F4F8FA',
    border: '1px solid var(--report-border)',
    borderRadius: '14px',
    textAlign: 'left',
    '@media (max-width: 820px)': { minWidth: 0, p: 0, bgcolor: 'transparent', border: 0 },
  },

  dateLabel: {
    color: 'var(--report-subtext)',
    fontSize: 11,
    fontWeight: 700,
    '@media (max-width: 820px)': { fontSize: 9 }
  },

  dateValue: {
    mt: 0.375,
    color: 'var(--report-system-dark)',
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    '@media (max-width: 820px)': { fontSize: 12 },
  },

  entity: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    minWidth: 0,
    p: 0
  },

  entityName: ({ entityColors }) => ({
    position: 'relative',
    m: 0,
    pr: 1.25,
    color: 'var(--report-text)',
    fontSize: 25,
    fontWeight: 700,
    lineHeight: 1.2,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      right: 0,
      width: 3,
      height: '100%',
      minHeight: 30,
      borderRadius: 999,
      bgcolor: entityColors.accent,
      transform: 'translateY(-50%)',
    },
    '@media (max-width: 820px)': { fontSize: 25 },
  }),

  metaWrap: {
    px: 3,
    pb: 2.25,
    '@media (max-width: 820px)': { px: 1.75, pb: 1.5 }
  },

  metaGrid: ({ columns = 3 }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 1,
    '@media (max-width: 820px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.75 },
    '@media print': { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
  }),

  metaItem: {
    minWidth: 0,
    px: 1.375,
    py: 1.125,
    color: '#FFFFFF',
    background: 'linear-gradient(135deg, var(--report-system-dark), #234F70)',
    border: '1px solid var(--report-system)',
    borderRadius: '10px',
    '@media (max-width: 820px)': { px: 1, py: 0.875 },
  },

  metaLabel: {
    display: 'block',
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 13,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '@media (max-width: 820px)': { fontSize: 11 },
  },

  metaValue: {
    display: 'block',
    mt: 0.375,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '@media (max-width: 820px)': { fontSize: 12 },
  },

  content: ({ typeColors }) => ({
    '--report-type-accent': typeColors.accent,
    '--report-type-dark': typeColors.accentDark,
    '--report-type-soft': typeColors.softBg,
    '--report-type-border': typeColors.border,
    flex: 1,
    px: 3,
    pb: 3,
    '@media (max-width: 820px)': { px: 1.75, pb: 1.75 },
  }),

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 2,
    mt: 'auto',
    px: 3,
    py: 1.5,
    bgcolor: '#F4F8FA',
    color: 'var(--report-subtext)',
    borderTop: '1px solid var(--report-border)',
    fontSize: 10,
    fontWeight: 700,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    '@media (max-width: 820px)': { px: 1.75, py: 1.25 },
  },
})

export const statusSx = ({ colors }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.875,
  px: 1.25,
  py: 0.75,
  bgcolor: colors.softBg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  '&::before': { content: '""', width: 7, height: 7, bgcolor: colors.solid, borderRadius: '50%' },
  '@media (max-width: 820px)': { px: 1, py: 0.625, fontSize: 10 },
})
