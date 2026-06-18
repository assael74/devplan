// src/features/playersDatabase/components/modals/modal.sx.js

const palette = {
  ink: '#17202a',
  muted: '#64717f',
  line: '#d8e0e7',
  slate: '#24313f',
  slateSoft: '#eef2f5',
  blue: '#2563eb',
  green: '#15803d',
  greenSoft: '#e7f7ec',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const modalSx = {
  createDialog: {
    width: 'min(860px, calc(100vw - 40px))',
    p: { xs: 1.5, md: 2 },
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
    mt: 0.5,
  },

  clubsField: {
    gridColumn: {
      xs: '1',
      md: '2',
    },
  },

  derivedBox: {
    gridColumn: '1 / -1',
    minHeight: 38,
    px: 1.25,
    py: 0.75,
    borderRadius: '8px',
    bgcolor: palette.slateSoft,
    color: palette.slate,
    display: 'flex',
    alignItems: 'center',
  },

  pasteDialog: {
    width: 'min(1080px, calc(100vw - 40px))',
    height: 'min(760px, calc(100dvh - 56px))',
    maxHeight: 'calc(100dvh - 56px)',
    minHeight: 0,
    p: {
      xs: 1.5,
      md: 2,
    },
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: {
      xs: 'auto auto 190px minmax(0, 1fr) auto auto',
      xl: 'auto auto 220px minmax(0, 1fr) auto auto',
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

  fieldLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: 700,
    mb: 0.5,
  },

  fieldControl: {
    minHeight: 38,
    borderRadius: '8px',
    fontSize: 13,
  },

  actions: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    mt: 0.5,
  },

  importZone: {
    p: 1,
    borderRadius: '8px',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
    minHeight: 0,
    overflow: 'hidden',
  },

  importFormGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
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

    '&:disabled': {
      bgcolor: '#f4f6f8',
      color: palette.muted,
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

  previewTable: {
    minWidth: 920,
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

    '& th:nth-of-type(1), & td:nth-of-type(1)': {
      width: 76,
    },

    '& th:nth-of-type(2), & td:nth-of-type(2)': {
      width: 58,
    },

    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      width: 260,
    },
  },

  clubAutocomplete: {
    minWidth: 0,
    bgcolor: '#fff',
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
