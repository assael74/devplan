// src/features/liveTagging/ui/toolbar/selection/sx/selectionFields.sx.js

export const selectionFieldsSx = {
  selectionFields: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'auto minmax(180px, 1fr) minmax(220px, 1.4fr)',
    },
    gap: {
      xs: 2,
      sm: 0.75,
    },
    alignItems: 'end',

    '& .MuiInput-root, & .MuiSelect-root, & .MuiAutocomplete-root': {
      minHeight: {
        xs: 42,
        sm: 36,
      },
    },
  },
}
