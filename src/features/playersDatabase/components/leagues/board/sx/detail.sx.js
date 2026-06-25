// src/features/playersDatabase/components/leagues/board/sx/detail.sx.js

const palette = {
  panel: '#ffffff',
  detailPanel: '#fbfdff',
  detailSoft: '#f1f6fb',
  tableSoft: '#f8fbff',
  line: '#d8e0e7',
  blueLine: '#c7d9ec',
  ink: '#17202a',
  muted: '#64717f',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const detailSx = {
  panel: {
    bgcolor: palette.detailPanel,
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
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
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

  actions: {
    display: 'flex',
    gap: 0.65,
    alignItems: 'center',
    flexShrink: 0,
  },

  openLeagueButton: {
    minWidth: 136,
    px: 1,
    fontWeight: 700,
  },

  editButton: {
    minWidth: 64,
    px: 0.9,
    fontWeight: 700,
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  editGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.65,
  },

  infoItem: {
    minHeight: 46,
    borderRadius: '7px',
    border: `1px solid ${palette.blueLine}`,
    bgcolor: palette.detailSoft,
    px: 0.75,
    py: 0.65,
    minWidth: 0,
  },

  label: {
    color: palette.muted,
    fontWeight: 700,
    mb: 0.25,
    fontSize: 11,
  },

  value: {
    color: palette.ink,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  error: {
    mt: 1,
    p: 0.85,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },

  embeddedSection: {
    mt: 0.75,
    pt: 0.75,
    borderTop: `1px solid ${palette.blueLine}`,
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
  },

  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 0.4,
    mb: 0.65,
    alignItems: 'center',
    minWidth: 0,
  },

  summaryChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.4,
    alignItems: 'center',
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

  tableWrap: {
    flex: 1,
    minHeight: 190,
    maxHeight: 'none',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${palette.blueLine}`,
    borderRadius: '7px',
    bgcolor: palette.tableSoft,
  },

  tableBodyScroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#b8c3cf transparent',

    '&::-webkit-scrollbar': {
      width: 5,
      height: 5,
    },

    '&::-webkit-scrollbar-thumb': {
      borderRadius: 999,
      backgroundColor: '#b8c3cf',
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  },

  table: {
    '--TableCell-paddingX': '8px',
    '--TableCell-paddingY': '7px',
    fontSize: 12,
    tableLayout: 'fixed',

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
      minWidth: 190,
      width: '30%',
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
    minHeight: 170,
    flex: 1,
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
}
