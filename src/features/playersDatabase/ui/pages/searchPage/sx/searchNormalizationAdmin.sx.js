// features/playersDatabase/ui/pages/searchPage/sx/searchNormalizationAdmin.sx.js

export const searchNormalizationAdminSx = {
  field: {
    mt: 0.5,
  },
  result: {
    p: 1.5,
    borderRadius: 'md',
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 1,
    mt: 1,
  },
  resultItem: {
    p: 1,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
    textAlign: 'center',
  },
  resultLabel: {
    color: 'text.tertiary',
  },
  resultNote: {
    mt: 1,
    color: 'text.secondary',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 1,
  },
}
