// src/dev/reports/sx/toolbar.sx.js

export const toolbarSx = {
  toolbar: {
    minWidth: 0,
    minHeight: 0,
    p: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    overflowY: 'auto',
    overflowX: 'hidden',
    borderInlineEnd: {
      xs: 0,
      lg: '1px solid',
    },
    borderBottom: {
      xs: '1px solid',
      lg: 0,
    },
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  toolbarHeader: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
    pb: 0.75,
  },

  categoriesList: {
    minWidth: 0,
  },

  scenario: {
    mt: 0.5,
    pt: 1.25,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  scenarioSelect: {
    width: '100%',
  },
}
