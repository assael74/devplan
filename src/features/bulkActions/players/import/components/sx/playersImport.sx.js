// src/features/bulkActions/players/import/components/sx/playersImport.sx.js

export const playersImportSx = {
  drawerContent: {
    width: { xs: '100%', md: 760 },
    maxWidth: '100%',
    overflow: 'hidden',
  },

  drawerSheet: {
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto auto auto minmax(0, 1fr) auto',
    gap: 1,
    p: 1.5,
  },

  drawerHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
  },

  drawerTitleWrap: {
    flex: 1,
    minWidth: 0,
  },

  mutedText: {
    color: 'text.secondary',
  },

  teamContext: {
    display: 'grid',
    gap: 0.2,
    p: 0.75,
    borderRadius: 'md',
    bgcolor: 'background.level1',
  },

  statusStack: {
    display: 'grid',
    gap: 0.75,
  },

  drawerBody: {
    minHeight: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1,
  },

  drawerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    pt: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    flexWrap: 'wrap',
  },

  drawerFooterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  savingSheet: {
    display: 'grid',
    gap: 0.75,
    borderRadius: 'md',
    p: 1,
  },

  savingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  savingTextWrap: {
    minWidth: 0,
  },

  errorSheet: {
    borderRadius: 'md',
    p: 1,
  },

  inputRoot: {
    minHeight: 0,
    display: 'grid',
    gap: 0.4,
  },

  pasteTextarea: {
    height: 86,
    minHeight: 86,
    maxHeight: 86,
    overflow: 'hidden',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 1.35,

    '& textarea': {
      height: '100% !important',
      maxHeight: '100% !important',
      overflow: 'auto !important',
    },
  },

  previewRoot: {
    minHeight: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
    gap: 0.75,
  },

  previewHeader: {
    display: 'grid',
    gap: 0.5,
  },

  summaryChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  warningSheet: {
    borderRadius: 'md',
    p: 0.75,
  },

  emptySheet: {
    borderRadius: 'md',
    p: 1,
  },

  tableWrap: {
    minHeight: 0,
    height: '100%',
    overflow: 'auto',
    borderRadius: 'md',
  },

  previewTable: {
    minWidth: 690,

    '& th': {
      whiteSpace: 'nowrap',
      py: 0.6,
      px: 0.75,
    },

    '& td': {
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      py: 0.45,
      px: 0.75,
    },

    '& th:nth-of-type(1)': {
      width: 85,
    },

    '& th:nth-of-type(2)': {
      width: 40,
    },

    '& th:nth-of-type(4)': {
      width: 95,
    },

    '& th:nth-of-type(5)': {
      width: 80,
    },

    '& th:nth-of-type(7)': {
      width: 80,
    },
  },
}
