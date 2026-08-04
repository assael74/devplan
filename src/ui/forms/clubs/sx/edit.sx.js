// ui/forms/clubs/sx/edit.sx.js

export const editSx = {
  root: ({ cols, areas }) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    gridTemplateAreas: areas,
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  }),

  field: (area) => ({
    gridArea: area,
    minWidth: 0,
  }),

  status: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
}
