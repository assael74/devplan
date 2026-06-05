// teamProfile/modules/games/components/entryDrawer/sx/import.sx.js

export const importSx = {
  content: {
    width: { xs: '100%', md: 760 },
    maxWidth: '100%',
  },

  sheet: {
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
    gap: 1.25,
    p: 2,
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
  },

  titleWrap: {
    flex: 1,
    minWidth: 0,
  },

  muted: {
    color: 'text.secondary',
  },

  body: {
    minHeight: 0,
    overflow: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 1.25,
    pr: 0.5,
  },

  textarea: {
    fontFamily: 'monospace',
    fontSize: 13,
    direction: 'ltr',
    textarea: {
      direction: 'ltr',
    },
  },

  summary: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  tableWrap: {
    borderRadius: 'md',
    overflow: 'auto',
    maxHeight: '38dvh',
  },

  table: {
    minWidth: 680,
    tableLayout: 'fixed',
    '& th': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& td': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      verticalAlign: 'middle',
    },
  },

  statusCell: {
    width: 76,
  },

  indexCell: {
    width: 42,
  },

  playerCell: {
    width: 300,
  },

  smallCell: {
    width: 70,
    textAlign: 'center',
  },

  minutesCell: {
    width: 72,
    textAlign: 'center',
  },

  playerCellWrap: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 0.5,
    minWidth: 0,
  },

  sourceName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  selectWrap: {
    width: '100%',
    minWidth: 0,
    '& .MuiFormLabel-root': {
      display: 'none',
    },
    '& .MuiFormControl-root': {
      width: '100%',
      minWidth: 0,
    },
    '& .MuiSelect-root': {
      width: '100%',
      minWidth: 0,
    },
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
    pt: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  footerGroup: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
  },
}
