// ui/forms/ui/players/sx/edit.sx.js

export const editSx = {
  sectionCard: {
    display: 'grid',
    gap: 1,
    p: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  infoGrid: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: {
      xs: '1fr',
      md: '1fr 1fr',
    },
  },

  statusTopRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: {
      xs: '1fr',
      md: 'auto minmax(220px, 1fr)',
    },
    alignItems: 'end',
  },

  activeWrap: {
    display: 'flex',
    alignItems: 'center',
    pt: { xs: 0, md: 3 },
    gap: 1,
  },

  roleTypeWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 1,
  },
}
