// ui/forms/meetings/sx/edit.sx.js

export const editSx = {
  panel: (layout) => ({
    mt: 1,
    p: layout.panelPadding,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: layout.panelBg,
  }),

  grid: (layout) => ({
    display: 'grid',
    width: '100%',
    gap: 1,
    gridTemplateColumns: layout.gridCols,
  }),

  field: {
    minWidth: 0,
  },

  divider: {
    mx: 1,
  },

  video: {
    minWidth: 0,
    pt: 1,
  },
}
