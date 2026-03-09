// teamProfile/modules/abilities/components/DrilldownModal.sx.js

export const drilldownModalSx = {
  dialog: {
    width: { xs: '96vw', md: 920 },
    maxWidth: '96vw',
    maxHeight: { xs: '88vh', md: '86vh' },
    overflow: 'hidden',
    p: 1.5,
  },

  header: {
    display: 'grid',
    gap: 0.5,
    pb: 1,
  },

  subHeaderRow: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  controlsRow: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    pb: 1,
  },

  content: {
    overflow: 'auto',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
  },

  tableWrap: {
    minWidth: 700,
  },

  table: {
    '& thead th': {
      position: 'sticky',
      top: 0,
      zIndex: 1,
      bgcolor: 'background.surface',
      borderBottom: '1px solid',
      borderColor: 'divider',
      fontWeight: 700,
    },
    '& tbody tr:hover': {
      bgcolor: 'neutral.softHoverBg',
    },
  },

  cellMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 240,
  },

  empty: {
    p: 2,
    textAlign: 'center',
    color: 'neutral.500',
  },

  footer: {
    pt: 1,
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
}
