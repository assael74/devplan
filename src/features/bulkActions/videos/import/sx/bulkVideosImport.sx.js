//  src/features/bulkActions/videos/import/sx/bulkVideosImport.sx.js

export const bulkVideosImportSx = {
  drawer: {
    width: {
      xs: '100%',
      sm: 760,
      md: 960,
    },
    maxWidth: '100%',
  },

  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'background.body',
  },

  header: {
    px: 2,
    py: 2,
    borderBottom: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
  },

  subtitle: {
    mt: 0.5,
    color: 'text.tertiary',
  },

  categoryValue: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  categoryOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  content: {
    flex: 1,
    overflow: 'auto',
    p: 2,
  },

  sectionTitle: {
    mb: 1,
  },

  textarea: {
    fontFamily: 'monospace',
    fontSize: 13,
  },

  previewSheet: {
    maxHeight: 430,
    overflow: 'hidden',
    borderRadius: 'md',
  },

  previewHeaderTable: {
    tableLayout: 'fixed',
    '& th': {
      fontSize: 12,
      whiteSpace: 'nowrap',
      bgcolor: 'background.level1',
      borderBottom: '1px solid',
      borderColor: 'divider',
    },
  },

  previewBodyScroll: {
    maxHeight: 360,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  previewBodyTable: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle',
      fontSize: 12,
    },
  },

  nameInput: {
    minWidth: 200,
  },

  linkText: {
    maxWidth: 280,
    direction: 'ltr',
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'text.tertiary',
  },

  rowError: {
    mt: 0.25,
    maxWidth: 280,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  categorySelect: {
    minWidth: 190,
  },

  footer: {
    px: 2,
    py: 1.5,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
}
