// C:\projects\devplan\src\features\hub\teamProfile\modules\videos\videos.sx.js
export const vidModuleSx = {
  root: {
    display: 'grid',
    gap: 1.25,
  },

  statsPanel: {
    variant: 'outlined',
    sx: {
      p: 1,
      px: 1.25,
      borderRadius: 'md',
      bgcolor: 'background.surface',
      borderColor: 'divider',
      overflow: 'visible',
      minWidth: 0,
    },
  },

  statsHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.75,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  kpisRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  topTagsRow: {
    mt: 0.25,
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    opacity: 0.95,
  },

  grid: {
    display: 'grid',
    gap: 1.25,
    width: '100%',
    maxWidth: 1600,
    mx: 'auto',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    alignItems: 'start',
  },
}
