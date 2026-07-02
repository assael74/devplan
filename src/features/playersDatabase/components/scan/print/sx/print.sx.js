const palette = {
  ink: '#17202a',
  muted: '#64717f',
  line: '#d8e0e7',
}

export const scanPrintSx = {
  section: {
    display: 'grid',
    gap: 1,
    color: palette.ink,
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

  table: {
    width: '100%',
    borderCollapse: 'collapse',

    '& th, & td': {
      border: `1px solid ${palette.line}`,
      p: 0.8,
      textAlign: 'left',
      fontSize: 12,
    },
  },

  summary: {
    color: palette.muted,
  },
}
