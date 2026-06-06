// teamProfile/desktop/modules/players/components/print/sx/print.sx.js

export const printSx = {
  root: {
    width: '100%',
    bgcolor: '#fff',
    color: '#111827',
    fontFamily: 'Arial, sans-serif',
    p: 0,
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
    pb: 1.5,
    mb: 1.5,
    borderBottom: '2px solid #111827',
  },

  titleWrap: {
    minWidth: 0,
  },

  title: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.25,
    color: '#111827',
  },

  teamName: {
    mt: 0.35,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#111827',
  },

  subtitle: {
    mt: 0.4,
    fontSize: 11,
    color: '#4b5563',
    fontWeight: 600,
  },

  meta: {
    fontSize: 10,
    color: '#6b7280',
    whiteSpace: 'nowrap',
  },

  kpiStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1,
    mb: 1.25,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  kpiBox: {
    minHeight: 36,
    border: '1px solid #d1d5db',
    borderRadius: 4,
    bgcolor: '#f9fafb',
    px: 1,
    py: 0.65,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    minWidth: 0,
  },

  kpiValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.1,
  },

  kpiLabel: {
    mt: 0.2,
    fontSize: 8.5,
    fontWeight: 700,
    color: '#6b7280',
    lineHeight: 1.1,
    maxWidth: '100%',
    overflow: 'hidden',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontSize: 10,
    breakInside: 'auto',
    pageBreakInside: 'auto',
  },

  th: {
    bgcolor: '#f3f4f6',
    color: '#111827',
    border: '1px solid #d1d5db',
    px: 0.65,
    py: 0.55,
    fontWeight: 700,
    verticalAlign: 'middle',
  },

  td: {
    border: '1px solid #d1d5db',
    px: 0.65,
    py: 0.7,
    color: '#111827',
    verticalAlign: 'top',
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },

  centerTd: {
    textAlign: 'center',
    verticalAlign: 'middle',
  },

  middleTd: {
    verticalAlign: 'middle',
  },

  indexTd: {
    textAlign: 'center',
    fontWeight: 700,
    color: '#374151',
  },

  playerCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.5,
    pl: 0.2,
    minWidth: 0,
  },

  avatar: {
    width: 26,
    height: 26,
    flexShrink: 0,
  },

  playerText: {
    minWidth: 0,
    display: 'grid',
    justifyItems: 'center',
  },

  name: {
    fontWeight: 700,
    fontSize: 10.5,
    lineHeight: 1.2,
    color: '#111827',
  },

  sub: {
    mt: 0.2,
    color: '#6b7280',
    fontSize: 8,
  },

  pill: {
    display: 'inline-block',
    px: 0.55,
    py: 0.2,
    borderRadius: 999,
    bgcolor: '#f3f4f6',
    border: '1px solid #d1d5db',
    fontSize: 9,
    fontWeight: 700,
    color: '#374151',
    ml: 0.35,
    mb: 0.35,
  },

  roleChip: {
    maxWidth: '100%',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 8,
    border: '1px solid',
    borderColor: 'divider',
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '0.35rem',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  compactMetaChip: {
    maxWidth: 42,
    justifyContent: 'center',
    fontSize: 0,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '0.25rem',

    '& .MuiChip-label': {
      display: 'none',
    },
  },

  positionChips: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 0.5,
    minHeight: 28,
  },

  positionChip: {
    width: 24,
    minWidth: 24,
    maxWidth: 24,
    justifyContent: 'center',
    fontSize: 7.5,
    fontWeight: 700,
    '--Chip-minHeight': '24px',
    '--Chip-paddingInline': 0,

    '& .MuiChip-label': {
      display: 'none',
    },
  },

  starsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 78,
    minHeight: 20,
  },

  metricChips: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 0.75,
  },

  metricChip: {
    minWidth: 42,
    maxWidth: 56,
    fontSize: 8,

    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '0.3rem',

    '& .MuiChip-label': {
      gap: 0,
    },
  },

  targetMetricChip: {
    minWidth: 46,
    maxWidth: 64,
    justifyContent: 'center',
    bgcolor: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    fontSize: 10,
    fontWeight: 700,
    '--Chip-minHeight': '21px',
    '--Chip-paddingInline': '0.32rem',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  performanceStatChips: {
    flexWrap: 'nowrap',
    justifyContent: 'center',
    gap: 0.35,
  },

  performanceStatChip: {
    minWidth: 38,
    maxWidth: 52,
    direction: 'rtl',
    gap: 0.25,
    fontSize: 9.3,
    '--Chip-paddingInline': '0.24rem',

    '& .MuiChip-startDecorator': {
      marginInlineEnd: 0.25,
      marginInlineStart: 0,

      '& svg': {
        fontSize: 10,
      },
    },

    '& .MuiChip-label': {
      gap: 0.15,
      justifyContent: 'center',
      direction: 'ltr',
    },
  },

  performanceTopChips: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 0.35,
  },

  performanceTopChip: {
    minWidth: 48,
    maxWidth: 118,
    //justifyContent: 'center',
    direction: 'rtl',
    gap: 0.35,
    fontSize: 10.5,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
    '--Chip-minHeight': '24px',
    '--Chip-paddingInline': '0.7rem',

    '& .MuiChip-startDecorator': {
      marginInlineEnd: 0.35,
      marginInlineStart: 0,
    },

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      direction: 'ltr',
    },
  },

  performanceIconChip: {
    width: 30,
    minWidth: 30,
    maxWidth: 30,
    '--Chip-paddingInline': 0,

    '& .MuiChip-label': {
      display: 'none',
    },
  },

  targetBox: {
    minHeight: 28,
    borderBottom: '1px dashed #9ca3af',
  },

  empty: {
    color: '#9ca3af',
  },

  footer: {
    mt: 1.25,
    pt: 0.8,
    borderTop: '1px solid #d1d5db',
    fontSize: 9,
    color: '#6b7280',
  },
}
