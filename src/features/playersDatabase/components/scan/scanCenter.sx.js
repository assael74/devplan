// src/features/playersDatabase/components/scan/scanCenter.sx.js

const palette = {
  bg: '#eef2f5',
  panel: '#ffffff',
  line: '#d8e0e7',
  ink: '#17202a',
  muted: '#64717f',
  blueSoft: '#e8f1ff',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const scanCenterSx = {
  root: {
    minHeight: 'calc(100vh - 72px)',
    height: { xs: 'auto', xl: 'calc(100vh - 72px)' },
    bgcolor: palette.bg,
    p: { xs: 1, md: 1.5 },
    overflow: { xs: 'visible', xl: 'hidden' },
  },

  shell: {
    height: '100%',
    minHeight: 0,
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    boxShadow: '0 12px 32px rgba(22, 34, 51, 0.07)',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
  },

  header: {
    px: 1.25,
    py: 1,
    borderBottom: `1px solid ${palette.line}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },

  headerActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: {
      xs: 'flex-start',
      lg: 'flex-end',
    },

    '& button': {
      minHeight: 34,
      borderRadius: '8px',
      fontWeight: 700,
    },
  },

  title: {
    fontWeight: 700,
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },

  kpis: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  toolbar: {
    px: 1,
    py: 0.75,
    borderBottom: `1px solid ${palette.line}`,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: '145px 145px 145px 190px minmax(180px, 1fr) auto auto auto',
    },
    gap: 0.75,
    alignItems: 'center',
    bgcolor: '#fbfcfd',
  },

  field: {
    minHeight: 34,
    borderRadius: '8px',
  },

  body: {
    minHeight: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 360px',
    },
    gap: 0.75,
    p: 0.75,
    bgcolor: '#f6f8fa',
  },

  listPanel: {
    minHeight: 0,
    overflow: 'hidden',
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
  },

  listHeader: {
    px: 1,
    py: 0.75,
    borderBottom: `1px solid ${palette.line}`,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 1,
    alignItems: 'center',
  },

  list: {
    minHeight: 0,
    overflow: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 0.5,
    p: 0.75,
  },

  collapseCard: {
    display: 'grid',
    gap: 0,
    borderRadius: '8px',
  },

  row: {
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    p: 1,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) auto',
    },
    gap: 1,
    alignItems: 'center',
    cursor: 'pointer',

    '&.isSelected': {
      bgcolor: palette.blueSoft,
      borderColor: '#b8d3ff',
    },
  },

  collapseBody: {
    border: `1px solid ${palette.line}`,
    borderTop: 0,
    borderRadius: '0 0 8px 8px',
    bgcolor: '#ffffff',
    p: 1,
    display: 'grid',
    gap: 1,
  },

  profilePickerHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },

  profilePickerActions: {
    display: 'grid',
    gap: 0.5,
    justifyItems: 'stretch',
  },

  profilePicker: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  scanResults: {
    display: 'grid',
    gap: 0.5,
    mt: 0.25,
  },

  scanResultRow: {
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#fbfcfd',
    p: 0.7,
    display: 'grid',
    gap: 0.55,
  },

  scanResultMain: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(0, 1fr)',
      lg: 'minmax(210px, 1.1fr) 220px minmax(420px, 2fr)',
    },
    alignItems: 'center',
    gap: 0.7,
    minWidth: 0,
  },

  scanIdentityCell: {
    minWidth: 0,
  },

  scanSubtext: {
    color: palette.muted,
    mt: 0.25,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
  },

  entityLink: {
    color: 'inherit',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,

    '&:hover': {
      color: '#0b6bcb',
      textDecoration: 'underline',
    },
  },

  subtextDivider: {
    color: palette.muted,
    flex: '0 0 auto',
  },

  scanPositionCell: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0.5,
    minWidth: 0,
  },

  scanSelect: {
    minHeight: 34,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
  },

  scanStatsTable: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(3, minmax(0, 1fr))',
      md: 'repeat(5, minmax(0, 1fr))',
    },
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    overflow: 'hidden',
    bgcolor: '#ffffff',
  },

  scanStatCell: {
    minWidth: 0,
    minHeight: 46,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    gap: 0.15,
    px: 0.35,
    py: 0.35,
    borderInlineEnd: `1px solid ${palette.line}`,
  },

  scanStatLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },

  scanStatValue: {
    fontWeight: 700,
    textAlign: 'center',
    minWidth: 0,
    lineHeight: 1.1,
  },

  editIconButton: {
    minWidth: 28,
    minHeight: 28,
    borderRadius: '8px',
  },

  errorInline: {
    color: palette.red,
    fontWeight: 700,
  },

  scanStatusRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  scanStatusLeft: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
  },

  scanStatusActions: {
    marginInlineStart: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.45,
  },

  rowTitle: {
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  rowMeta: {
    color: palette.muted,
    mt: 0.25,
  },

  rowStats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.45,
    justifyContent: { xs: 'flex-start', lg: 'flex-end' },
  },

  details: {
    minHeight: 0,
    overflow: 'auto',
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    p: 1,
  },

  detailsTitle: {
    fontWeight: 700,
    mb: 0.5,
  },

  facts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.75,
    mt: 1,
  },

  fact: {
    minHeight: 58,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#fbfcfd',
    p: 0.85,
  },

  factLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: 700,
  },

  factValue: {
    fontWeight: 700,
    mt: 0.35,
  },

  children: {
    mt: 1,
    display: 'grid',
    gap: 0.5,
  },

  childRow: {
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    p: 0.75,
    bgcolor: '#ffffff',
  },

  profileBreakdownRow: {
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    p: 0.75,
    bgcolor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },

  error: {
    color: palette.red,
    bgcolor: palette.redSoft,
    borderRadius: '8px',
    p: 0.8,
    fontWeight: 700,
  },

  printSection: {
    display: 'grid',
    gap: 1,
  },

  reportBoxes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.75,
    mt: 1,
  },

  reportEmptyBox: {
    minHeight: 110,
    border: `1px dashed ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
  },

  printTable: {
    width: '100%',
    borderCollapse: 'collapse',

    '& th, & td': {
      border: `1px solid ${palette.line}`,
      p: 0.8,
      textAlign: 'left',
      fontSize: 12,
    },
  },
}
