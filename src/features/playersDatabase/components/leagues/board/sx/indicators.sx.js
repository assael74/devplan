// src/features/playersDatabase/components/leagues/board/sx/indicators.sx.js

const palette = {
  panel: '#fbfdff',
  tableSoft: '#f8fbff',
  blueLine: '#c7d9ec',
  ink: '#17202a',
  muted: '#64717f',

  printInk: '#111827',
  printMuted: '#4b5563',
  printBlue: '#1d4ed8',
  printBlueDark: '#1e40af',
  printBlueSoft: '#eff6ff',
  printLine: '#d1d5db',
  printHeader: '#eef2f7',
}

export const indicatorSx = {
  panel: {
    bgcolor: palette.panel,
    border: `1px solid ${palette.blueLine}`,
    borderRadius: '8px',
    p: 0.75,
    minWidth: 0,
    minHeight: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  embeddedPanel: {
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    mb: 0.65,
  },

  title: {
    fontWeight: 700,
  },

  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 0.4,
    mb: 0.65,
    minWidth: 0,
  },

  summaryChips: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.4,
    minWidth: 0,

    '& .MuiChip-root': {
      minHeight: 22,
      fontSize: 10.5,
      fontWeight: 700,
    },
  },

  printButton: {
    width: 28,
    minWidth: 28,
    minHeight: 26,
    flexShrink: 0,

    '& svg': {
      fontSize: 17,
    },
  },

  leagueLink: {
    minHeight: 20,
    px: 0.25,
    py: 0,
    fontSize: 12,
    fontWeight: 700,
    maxWidth: '100%',
    justifyContent: 'flex-start',

    '& .MuiButton-startDecorator, & .MuiButton-endDecorator': {
      display: 'none',
    },

    '& .MuiButton-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  tableWrap: {
    flex: 1,
    minHeight: 190,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: `1px solid ${palette.blueLine}`,
    borderRadius: '7px',
    bgcolor: palette.tableSoft,
  },

  tableBodyScroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
  },

  table: {
    '--TableCell-paddingX': '8px',
    '--TableCell-paddingY': '7px',

    width: '100%',
    tableLayout: 'fixed',
    fontSize: 12,

    '& th': {
      bgcolor: '#eaf2fb',
      color: palette.muted,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },

    '& td': {
      color: palette.ink,
      fontWeight: 600,
      verticalAlign: 'middle',
    },

    '& th:first-of-type, & td:first-of-type': {
      width: 30,
      minWidth: 30,
      maxWidth: 30,
      px: 0.4,
      textAlign: 'center',
    },

    '& th:nth-of-type(2), & td:nth-of-type(2)': {
      width: '30%',
      minWidth: 190,
    },

    '& th:nth-of-type(5), & td:nth-of-type(5)': {
      width: 64,
      minWidth: 64,
      maxWidth: 72,
      px: 0.5,
      textAlign: 'center',
    },

    '& th:nth-of-type(6), & td:nth-of-type(6)': {
      width: 92,
      minWidth: 92,
      maxWidth: 104,
      px: 0.5,
      textAlign: 'center',
    },

    '& td:nth-of-type(3), & td:nth-of-type(4)': {
      maxWidth: 150,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    '& tbody tr.isSevere': {
      bgcolor: '#fff6f3',
    },

    '& td .MuiChip-root': {
      minHeight: 20,
      fontSize: 10.5,
      fontWeight: 700,
    },
  },

  countNote: {
    mt: 0.45,
    color: palette.muted,
    fontWeight: 700,
    textAlign: 'left',
  },

  emptyState: {
    flex: 1,
    minHeight: 170,
    display: 'grid',
    placeItems: 'center',
    border: `1px dashed ${palette.blueLine}`,
    borderRadius: '7px',
    bgcolor: palette.tableSoft,
  },

  emptyText: {
    color: palette.muted,
    fontWeight: 700,
  },

  printSection: {
    p: 2,
    display: 'grid',
    gap: 1.5,
    color: palette.printInk,
  },

  printTitle: {
    mb: 0.5,
    fontWeight: 700,
  },

  printSummary: {
    color: palette.printMuted,
  },

  printContextCard: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',
    gap: 1,
    p: 1.25,
    border: `2px solid ${palette.printBlue}`,
    borderRadius: '8px',
    bgcolor: palette.printBlueSoft,
  },

  printContextLabel: {
    mb: 0.35,
    color: palette.printBlueDark,
    fontWeight: 700,
  },

  printContextValue: {
    color: palette.printInk,
    fontWeight: 700,
  },

  printTable: {
    '--TableCell-paddingX': '8px',
    '--TableCell-paddingY': '7px',

    tableLayout: 'fixed',
    fontSize: 12,
    border: `1px solid ${palette.printLine}`,

    '& th': {
      bgcolor: palette.printHeader,
      color: '#374151',
      fontWeight: 700,
    },

    '& td': {
      color: palette.printInk,
      fontWeight: 600,
      verticalAlign: 'middle',
    },
  },
}
