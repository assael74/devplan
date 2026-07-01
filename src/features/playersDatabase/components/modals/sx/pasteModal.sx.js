// features/playersDatabase/components/modals/sx/pasteModal.sx.js
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

export const pasteModalSx = {
  dialog: {
    width: 'min(1080px, calc(100vw - 40px))',
    height: 'min(760px, calc(100dvh - 56px))',
    maxHeight: 'calc(100dvh - 56px)',
    minHeight: 0,
    p: { xs: 1.5, md: 2 },
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: {
      xs: 'auto auto auto 190px minmax(0, 1fr) auto auto',
      xl: 'auto auto auto 220px minmax(0, 1fr) auto auto',
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

  importZone: {
    p: 1,
    borderRadius: '8px',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
    minHeight: 0,
    overflow: 'hidden',
  },

  formGrid: {
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

  table: {
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

    '& th:nth-of-type(4), & td:nth-of-type(4)': {
      width: 118,
    },
  },

  clubAutocomplete: {
    minWidth: 0,
    bgcolor: '#fff',
  },

  slotInput: {
    width: 44,
    minHeight: 28,
    borderRadius: '7px',
    bgcolor: '#fff',

    '& input': {
      p: 0,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 700,
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
