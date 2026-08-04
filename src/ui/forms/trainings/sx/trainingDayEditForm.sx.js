// ui/forms/trainings/sx/trainingDayEditForm.sx.js

export const trainingDayEditFormSx = {
  root: (layout) => ({
    display: 'grid',
    gap: layout.sectionGap,
  }),

  grid: (layout) => ({
    display: 'grid',
    gap: layout.gap,
    gridTemplateColumns: layout.gridCols,
  }),
}
