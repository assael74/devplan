// features/playersDatabase/components/summary/print/print.sx.js

const palette = {
  ink: '#111827',
  muted: '#4b5563',
  blue: '#1d4ed8',
  blueDark: '#1e40af',
  blueSoft: '#eff6ff',
  line: '#d1d5db',
  header: '#eef2f7',
}

export const summaryPrintSx = {
  button: {
    width: 28,
    minWidth: 28,
    minHeight: 26,
    flexShrink: 0,

    '& svg': {
      fontSize: 17,
    },
  },

  section: {
    p: 2,
    display: 'grid',
    gap: 1.5,
    color: palette.ink,
  },

  pageBreak: {
    breakBefore: 'page',
    pageBreakBefore: 'always',
  },

  header: {
    display: 'grid',
    gap: 0.5,
  },

  title: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.2,
  },

  subtitle: {
    color: palette.muted,
    fontSize: 13,
  },

  summary: {
    color: palette.muted,
  },

  contextCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 1,
    p: 1.25,
    border: `2px solid ${palette.blue}`,
    borderRadius: '8px',
    bgcolor: palette.blueSoft,
  },

  contextLabel: {
    mb: 0.35,
    color: palette.blueDark,
    fontWeight: 700,
  },

  contextValue: {
    color: palette.ink,
    fontWeight: 700,
  },

  profileList: {
    display: 'grid',
    gap: 0.75,
  },

  profileRow: {
    display: 'grid',
    gridTemplateColumns: '34px 1fr',
    gap: 1,
    alignItems: 'flex-start',
    padding: '10px 12px',
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    backgroundColor: '#fbfcfd',
  },

  profileIcon: {
    width: 28,
    height: 28,
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: palette.blue,
    backgroundColor: palette.blueSoft,
    border: '1px solid #c7dafe',

    '& svg': {
      fontSize: 18,
    },
  },

  profileContent: {
    display: 'grid',
    gap: 0.45,
  },

  profileName: {
    fontSize: 18,
    fontWeight: 700,
  },

  profileMeta: {
    display: 'grid',
    gap: 0.2,
    fontSize: 13.5,
    color: '#4b5563',
    lineHeight: 1.55,
  },

  profileMetaLabel: {
    color: '#111827',
    fontWeight: 800,
  },

  collectionList: {
    display: 'grid',
    gap: 0.75,
  },

  collectionRow: {
    display: 'grid',
    gap: 0.25,
    padding: '10px 12px',
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    backgroundColor: '#fbfcfd',
  },

  collectionName: {
    fontSize: 13,
    fontWeight: 800,
  },

  collectionDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 1.45,
  },

  row: {
    display: 'grid',
    gap: 0.5,
    fontSize: 13,
    lineHeight: 1.5,
  },

  table: {
    '--TableCell-paddingX': '8px',
    '--TableCell-paddingY': '7px',

    tableLayout: 'fixed',
    fontSize: 12,
    border: `1px solid ${palette.line}`,

    '& th': {
      bgcolor: palette.header,
      color: '#374151',
      fontWeight: 700,
    },

    '& td': {
      color: palette.ink,
      fontWeight: 600,
      verticalAlign: 'middle',
    },
  },
}
