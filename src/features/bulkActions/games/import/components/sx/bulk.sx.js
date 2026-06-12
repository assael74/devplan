// src/features/bulkActions/games/import/components/sx/bulk.sx.js

export const bulkSx = {
  drawerContent: {
    width: { xs: '100%', md: 720 },
    maxWidth: '100%',
  },

  drawerSheet: {
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto auto auto minmax(0, 1fr) auto',
    gap: 1.25,
    p: 2,
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

  statusStack: {
    display: 'grid',
    gap: 1,
  },

  drawerBody: {
    minHeight: 0,
    overflow: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 1.5,
    pr: 0.5,
    pb: 0.5,
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
    gap: 1,
    borderRadius: 'md',
    p: 1.25,
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
    p: 1.25,
  },

  inputRoot: {
    display: 'grid',
    gap: 1,
  },

  pasteTextarea: {
    fontFamily: 'monospace',
    fontSize: 13,
    direction: 'ltr',
    textarea: {
      direction: 'ltr',
    },
  },

  previewRoot: {
    display: 'grid',
    gap: 1.25,
  },

  previewHeader: {
    display: 'grid',
    gap: 0.75,
  },

  summaryChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  warningSheet: {
    borderRadius: 'md',
    p: 1.25,
  },

  emptySheet: {
    borderRadius: 'md',
    p: 1.5,
  },

  tableWrap: {
    borderRadius: 'md',
    overflow: 'auto',
    maxHeight: '32dvh',
  },

  previewTable: {
    minWidth: 720,
    '& th': {
      whiteSpace: 'nowrap',
    },
    '& td': {
      whiteSpace: 'nowrap',
      verticalAlign: 'top',
    },
  },
}

export const teamGamesBulkSx = {
  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },
}
