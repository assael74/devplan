// ui/forms/ui/clubs/sx/edit.sx.js

export const editSx = {
  root: {
    display: 'grid',
    gap: 1,
    overflowY: 'auto',
    minHeight: 0,
  },

  sectionCard: {
    display: 'grid',
    gap: 1.25,
    p: 1.25,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  gridInfo: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 1,
  },

  inlineChecks: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },
}
