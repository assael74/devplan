// src/features/playersDatabase/components/modals/playerStats/sx/playerStatsModal.sx.js

const palette = {
  ink: '#17202a',
  muted: '#64717f',
  line: '#d8e0e7',
  blue: '#2563eb',
  green: '#15803d',
  red: '#b42318',
}

export const playerStatsModalSx = {
  dialog: {
    width: 'min(1120px, calc(100vw - 40px))',
    height: 'min(740px, calc(100dvh - 56px))',
    maxHeight: 'calc(100dvh - 56px)',
    minHeight: 0,
    p: { xs: 1.5, md: 2 },
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto auto 190px minmax(0, 1fr) auto',
    gap: 1,
  },

  title: {
    fontWeight: 700,
  },

  meta: {
    color: palette.muted,
  },

  snapRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minHeight: 30,
  },

  snapSelect: {
    width: 140,
    minHeight: 28,
    fontSize: 12,
  },

  roundInput: {
    width: 120,
    minHeight: 28,
    fontSize: 12,
  },

  pasteZone: {
    p: 1,
    borderRadius: '8px',
    minHeight: 0,
    overflow: 'hidden',
  },

  pasteBox: {
    width: '100%',
    height: '100%',
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
    color: palette.ink,

    '&:focus': {
      borderColor: palette.blue,
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.14)',
    },
  },

  previewZone: {
    p: 1,
    borderRadius: '8px',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
    overflow: 'hidden',
  },

  summaryChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  tableWrap: {
    minHeight: 0,
    overflow: 'auto',
    borderRadius: '8px',
  },

  table: {
    minWidth: 1680,
    width: '100%',
    tableLayout: 'fixed',

    '& th, & td': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      px: 0.75,
      fontSize: 12,
      textAlign: 'center',
    },

    '& th': {
      fontWeight: 700,
    },

    '& th:nth-of-type(2), & td:nth-of-type(2)': {
      width: 180,
      textAlign: 'left',
    },

    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      width: 210,
      textAlign: 'left',
    },

    '& th:nth-of-type(4), & td:nth-of-type(4)': {
      width: 220,
      textAlign: 'center',
    },

    '& th:nth-of-type(5), & td:nth-of-type(5)': {
      width: 190,
      textAlign: 'center',
    },

    '& th:nth-of-type(6), & td:nth-of-type(6)': {
      width: 110,
      textAlign: 'center',
    },

    '& th:nth-of-type(7), & td:nth-of-type(7)': {
      width: 320,
      textAlign: 'left',
    },

    '& td.isError': {
      color: palette.red,
      fontWeight: 700,
    },

    '& td.isLtr': {
      unicodeBidi: 'isolate',
      textAlign: 'center',
    },
  },

  playerSelect: {
    width: '100%',
    minHeight: 28,
    fontSize: 12,
  },

  reasonSelect: {
    width: 132,
    minHeight: 24,
    fontSize: 11,
  },

  teamSelect: {
    width: 150,
    minHeight: 24,
    fontSize: 11,
  },

  addedPlayerChip: {
    maxWidth: '100%',
    justifyContent: 'flex-start',
    fontWeight: 700,
  },

  scoutChip: {
    maxWidth: '100%',
    fontWeight: 700,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  reliabilityChip: {
    minWidth: 82,
    justifyContent: 'center',
    fontWeight: 700,
    direction: 'ltr',
  },

  metricsCell: {
    display: 'block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'help',
    direction: 'rtl',
  },

  rowActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
  },

  actBtn: {
    minHeight: 24,
    px: 0.75,
    fontSize: 11,
    fontWeight: 700,
  },

  undoBtn: {
    minHeight: 22,
    px: 0.5,
    fontSize: 11,
    fontWeight: 700,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
  },

  spacer: {
    flex: 1,
  },

  successText: {
    color: palette.green,
    fontWeight: 700,
  },
}
