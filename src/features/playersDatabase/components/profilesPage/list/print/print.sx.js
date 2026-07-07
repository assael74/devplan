// features/playersDatabase/components/profilesPage/list/print/print.sx.js

const palette = {
  ink: '#17202a',
  muted: '#64717f',
  line: '#d8e0e7',
  softBlue: '#edf5ff',
  softGreen: '#e6f6ea',
  softGold: '#fff5da',
  softRose: '#fbe8e8',
  softTeal: '#e8f7f5',
  strongGreen: '#1f7a3f',
  strongRed: '#ba1b1b',
}

export const printTableColumns = {
  index: '4%',
  player: '22%',
  team: '22%',
  position: '16%',
  minutes: '8%',
  goals: '8%',
  starts: '8%',
  notes: '12%',
}

const columnWidthSx = width => ({
  width,
  minWidth: width,
  maxWidth: width,
})

const columnSelectorSx = widths => ({
  '& > thead > tr > th:nth-of-type(1), & > tbody > tr > td:nth-of-type(1)': columnWidthSx(widths.index),
  '& > thead > tr > th:nth-of-type(2), & > tbody > tr > td:nth-of-type(2)': columnWidthSx(widths.player),
  '& > thead > tr > th:nth-of-type(3), & > tbody > tr > td:nth-of-type(3)': columnWidthSx(widths.team),
  '& > thead > tr > th:nth-of-type(4), & > tbody > tr > td:nth-of-type(4)': columnWidthSx(widths.position),
  '& > thead > tr > th:nth-of-type(5), & > tbody > tr > td:nth-of-type(5)': columnWidthSx(widths.minutes),
  '& > thead > tr > th:nth-of-type(6), & > tbody > tr > td:nth-of-type(6)': columnWidthSx(widths.goals),
  '& > thead > tr > th:nth-of-type(7), & > tbody > tr > td:nth-of-type(7)': columnWidthSx(widths.starts),
  '& > thead > tr > th:nth-of-type(8), & > tbody > tr > td:nth-of-type(8)': columnWidthSx(widths.notes),
})

export const printSx = {
  section: {
    display: 'grid',
    gap: 1,
    color: palette.ink,
  },

  reportBoxes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.75,
    mt: 1,
  },

  reportEmptyBox: {
    minHeight: 110,
    border: `1px dashed ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
  },

  reportSummaryBox: {
    minHeight: 110,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    p: 1.25,
    display: 'grid',
    alignContent: 'center',
    gap: 0.3,
  },

  reportSummaryLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: 700,
  },

  reportSummaryValue: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.1,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    ...columnSelectorSx(printTableColumns),
    '& th, & td': {
      border: `1px solid ${palette.line}`,
      padding: '8px 10px',
      textAlign: 'left',
      verticalAlign: 'top',
      fontSize: 12,
    },
    '& th': {
      background: `linear-gradient(135deg, ${palette.ink}, #35506d)`,
      color: '#fff',
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
    '& tbody tr:nth-of-type(odd)': {
      backgroundColor: '#fbfdff',
    },
    '& tbody tr:nth-of-type(even)': {
      backgroundColor: '#f5f9fc',
    },
  },

  cellBase: {
    fontWeight: 700,
  },

  indexCell: {
    textAlign: 'left',
    color: palette.muted,
  },

  positionCell: {
    background: `linear-gradient(180deg, ${palette.softTeal}, #ffffff)`,
  },

  positionCellMissing: {
    background: `linear-gradient(180deg, #fdeaea, #ffffff)`,
  },

  goalsCell: {
    background: `linear-gradient(180deg, ${palette.softGreen}, #ffffff)`,
  },

  notesCell: {
    background: `linear-gradient(180deg, ${palette.softRose}, #ffffff)`,
  },

  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  avatar: {
    width: 30,
    height: 30,
    flex: '0 0 auto',
    border: `1px solid ${palette.line}`,
    boxShadow: '0 2px 6px rgba(23, 32, 42, 0.08)',
  },

  nameText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  playerName: {
    color: palette.ink,
    fontWeight: 700,
    lineHeight: 1.15,
  },

  positionLayer: {
    color: palette.muted,
    fontWeight: 700,
    lineHeight: 1.1,
  },

  positionPrimary: {
    color: palette.ink,
    fontWeight: 700,
    lineHeight: 1.1,
  },

  goalsValue: {
    color: palette.strongGreen,
    fontWeight: 700,
  },

  notesCellHasNotes: {
    background: `linear-gradient(180deg, #fff0ca, #ffffff)`,
  },

  notesText: {
    color: palette.ink,
    lineHeight: 1.35,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },

  rowEven: {
    backgroundColor: '#fbfdff',
  },

  rowOdd: {
    backgroundColor: '#f5f9fc',
  },

  summary: {
    color: palette.muted,
  },
}
