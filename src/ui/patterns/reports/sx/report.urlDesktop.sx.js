// ui/patterns/reports/sx/report.urlDesktop.sx.js

export const buildReportUrlDesktopSx = ({
  systemColors,
}) => ({
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
    height: 'calc(100vh - 32px)',
    mx: 'auto',
    my: 4,
    bgcolor: 'var(--report-surface)',
    color: 'var(--report-text)',
    border: '1px solid var(--report-border)',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(23, 32, 51, 0.08)',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '0 0 auto',
      height: 4,
      bgcolor: 'var(--report-system)',
      zIndex: 2,
    },
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
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
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
  },

  brandCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.125,
  },

  brandName: {
    fontSize: 15,
    fontWeight: 700,
  },

  brandSubtitle: {
    color: 'var(--report-subtext)',
    fontSize: 11,
    fontWeight: 700,
  },

  header: {
    px: 3,
    pb: 1.5,
    pt: 0.5
  },

  scrollArea: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  mainRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2.5,
    mb: 1.5,
  },

  title: {
    m: 0,
    color: 'var(--report-system-dark)',
    fontSize: 'clamp(26px, 4vw, 38px)',
    lineHeight: 1.12,
    fontWeight: 700,
  },

  date: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 195,
    px: 1.875,
    py: 1,
    background: 'linear-gradient(180deg, #F8FBFD 0%, #EEF4F8 100%)',
    border: '1px solid rgba(42, 96, 136, 0.14)',
    borderRadius: '14px',
    textAlign: 'left',
    boxShadow: '0 8px 18px rgba(23, 59, 87, 0.08)',
    transition: 'box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease',
    '&:hover': {
      boxShadow: '0 12px 24px rgba(23, 59, 87, 0.12)',
      transform: 'translateY(-1px)',
      borderColor: 'rgba(42, 96, 136, 0.22)',
    },
  },

  dateLabel: {
    color: 'var(--report-subtext)',
    fontSize: 11,
    fontWeight: 700,
  },

  dateValue: {
    mt: 0.375,
    color: 'var(--report-system-dark)',
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  dateSelect: {
    mt: 0.375,
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
    '--Select-minHeight': 'unset',
    '--Select-radius': '0',
    '--Select-indicator-size': '0px',
    '--Select-gap': '0',
    '--Select-paddingInline': '0',
    '--Select-focusedThickness': '0px',
    '--Select-decoratorColor': 'var(--report-system-dark)',
    '--Select-decoratorChildHeight': 'unset',
    bgcolor: 'transparent',
    border: 0,
    boxShadow: 'none',
    '& .MuiSelect-button': {
      p: 0,
      minHeight: 'unset',
      minWidth: 0,
      border: 0,
      bgcolor: 'transparent',
      color: 'var(--report-system-dark)',
      boxShadow: 'none',
      justifyContent: 'flex-start',
      '&:hover': {
        bgcolor: 'transparent',
      },
      '&:focus-visible': {
        outline: 'none',
      },
    },
    '& .MuiSelect-indicator': {
      display: 'none',
    },
  },

  dateValueWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  dateValueText: {
    color: 'var(--report-system-dark)',
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  dateVersionTag: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    px: 0.5,
    borderRadius: 999,
    bgcolor: 'rgba(23, 59, 87, 0.08)',
    color: 'var(--report-system-dark)',
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1,
  },

  dateSelectButton: {
    p: 0,
    minHeight: 'unset',
    minWidth: 0,
    color: 'var(--report-system-dark)',
    fontSize: 15,
    fontWeight: 700,
    border: 0,
    bgcolor: 'transparent',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: 'transparent',
    },
  },

  dateSelectListbox: {
    minWidth: '0',
    width: '100%',
    p: 0.5,
    borderRadius: '12px',
    boxShadow: '0 12px 30px rgba(23, 32, 51, 0.12)',
    boxSizing: 'border-box',
  },

  dateSelectPopper: {
    width: 'calc(var(--Select-trigger-width) - 12px)',
    maxWidth: 'calc(var(--Select-trigger-width) - 12px)',
  },

  dateOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    width: '100%',
  },

  dateOptionDate: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--report-text)',
  },

  dateOptionVersion: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    px: 0.5,
    borderRadius: 999,
    bgcolor: 'rgba(23, 59, 87, 0.08)',
    color: 'var(--report-system-dark)',
    fontSize: 11,
    fontWeight: 700,
  },

  entity: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    minWidth: 0,
    p: 0,
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
  }),

  metaWrap: {
    px: 3,
    pb: 2.25,
  },

  metaGrid: ({ columns = 3 }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 1,
  }),

  metaItem: {
    minWidth: 0,
    px: 1.375,
    py: 1.125,
    color: '#FFFFFF',
    background: 'linear-gradient(135deg, var(--report-system-dark), #234F70)',
    border: '1px solid var(--report-system)',
    borderRadius: '10px',
  },

  metaLabel: {
    display: 'block',
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 13,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
  },

  content: ({ typeColors }) => ({
    '--report-type-accent': typeColors.accent,
    '--report-type-dark': typeColors.accentDark,
    '--report-type-soft': typeColors.softBg,
    '--report-type-border': typeColors.border,
    flex: 1,
    px: 3,
    pb: 3,
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
  },
})

export const buildReportStatusSx = ({ colors }) => ({
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
  '&::before': {
    content: '""',
    width: 7,
    height: 7,
    bgcolor: colors.solid,
    borderRadius: '50%',
  },
})
