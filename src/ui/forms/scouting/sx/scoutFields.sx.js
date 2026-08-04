// ui/forms/scouting/sx/scoutFields.sx.js

export const scoutFieldsSx = {
  root: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  row: (cols, gap) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    gap,
    alignItems: 'start',
    minWidth: 0,
  }),
}
