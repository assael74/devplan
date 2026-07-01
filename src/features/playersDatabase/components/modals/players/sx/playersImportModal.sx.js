// src/features/playersDatabase/components/modals/players/sx/playersImportModal.sx.js

const palette = {
  ink: '#17202a',
  muted: '#64717f',
  line: '#d8e0e7',
  blue: '#2563eb',
  green: '#15803d',
  greenSoft: '#e7f7ec',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const playersImportModalSx = {
  dialog: {
    width: 'min(1180px, calc(100vw - 40px))',
    height: 'min(780px, calc(100dvh - 56px))',
    maxHeight: 'calc(100dvh - 56px)',
    minHeight: 0,
    p: { xs: 1.5, md: 2 },
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: {
      xs: 'auto auto auto 220px minmax(0, 1fr) auto auto',
      xl: 'auto auto auto 240px minmax(0, 1fr) auto auto',
    },
    gap: 1,
  },

  title: {
    fontWeight: 700,
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },

  contextInfo: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.65,
    minHeight: 26,

    '& .MuiChip-root': {
      minHeight: 22,
      fontSize: 12,
      fontWeight: 700,
    },
  },

  contextLabel: {
    color: palette.muted,
    fontWeight: 700,
  },

  importZone: {
    p: 1,
    borderRadius: '8px',
    display: 'grid',
    minHeight: 0,
    overflow: 'hidden',
  },

  pasteBox: {
    width: '100%',
    height: '100%',
    minHeight: 0,
    maxHeight: '100%',
    boxSizing: 'border-box',
    resize: 'none',
    overflow: 'auto',
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    p: 1,
    font: 'inherit',
    fontSize: 13,
    lineHeight: 1.6,
    outline: 'none',
    bgcolor: '#fff',
    color: palette.ink,

    '&:focus': {
      borderColor: palette.blue,
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.14)',
    },
  },

  previewZone: {
    p: 1,
    borderRadius: '8px',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
    minHeight: 0,
    overflow: 'hidden',
  },

  previewTop: {
    display: 'grid',
    gap: 0.75,
  },

  summaryChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  tableWrap: {
    minHeight: 0,
    maxHeight: '100%',
    borderRadius: '8px',
    overflowY: 'auto',
    overflowX: 'auto',
  },

  table: {
    minWidth: 1880,
    width: '100%',
    tableLayout: 'fixed',

    '& th': {
      whiteSpace: 'nowrap',
      fontWeight: 700,
      px: 0.75,
    },

    '& td': {
      px: 0.75,
      fontSize: 13,
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    '& td.isLtr': {
      direction: 'ltr',
      textAlign: 'left',
      fontFamily: 'monospace',
      fontSize: 12,
    },

    '& th:nth-of-type(1), & td:nth-of-type(1)': {
      width: 76,
    },

    '& th:nth-of-type(2), & td:nth-of-type(2)': {
      width: 56,
    },

    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      width: 180,
    },

    '& th:nth-of-type(4), & td:nth-of-type(4)': {
      width: 92,
    },

    '& th:nth-of-type(5), & td:nth-of-type(5)': {
      width: 130,
    },

    '& th:nth-of-type(6), & td:nth-of-type(6)': {
      width: 76,
    },

    '& th:nth-of-type(7), & td:nth-of-type(7)': {
      width: 96,
    },

    '& th:nth-of-type(8), & td:nth-of-type(8)': {
      width: 190,
    },

    '& th:nth-of-type(9), & td:nth-of-type(9)': {
      width: 180,
    },

    '& th:nth-of-type(10), & td:nth-of-type(10)': {
      width: 120,
    },

    '& th:nth-of-type(11), & td:nth-of-type(11)': {
      width: 190,
    },

    '& th:nth-of-type(12), & td:nth-of-type(12)': {
      width: 92,
    },

    '& th:nth-of-type(13), & td:nth-of-type(13)': {
      width: 170,
    },

    '& th:nth-of-type(14), & td:nth-of-type(14)': {
      width: 210,
    },

    '& th:nth-of-type(15), & td:nth-of-type(15)': {
      width: 230,
    },

    '& th:nth-of-type(16), & td:nth-of-type(16)': {
      width: 260,
    },
  },

  actions: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    mt: 0.5,
  },

  success: {
    p: 1,
    borderRadius: '8px',
    bgcolor: palette.greenSoft,
    color: palette.green,
    fontWeight: 700,
  },

  error: {
    p: 1,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },
}
