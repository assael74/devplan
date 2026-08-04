// ui/forms/parents/sx/parentFields.sx.js

export const parentFieldsSx = {
  root: {
    display: 'grid',
    gap: 1.25,
    minWidth: 0,
  },

  row: (cols, gap) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    gap,
    minWidth: 0,
  }),

  field: {
    minWidth: 0,
  },
}
