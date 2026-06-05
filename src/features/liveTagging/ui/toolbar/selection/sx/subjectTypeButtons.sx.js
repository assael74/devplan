// src/features/liveTagging/ui/toolbar/selection/sx/subjectTypeButtons.sx.js

export const subjectTypeButtonsSx = {
  selectionTypeActions: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr 1fr',
      sm: 'repeat(4, auto)',
    },
    gap: {
      xs: 0.65,
      sm: 0.5,
    },
    pb: 0.1,
  },

  subjectTypeButton: selected => ({
    minHeight: {
      xs: 42,
      sm: 32,
    },
    border: '1px solid',
    borderColor: selected ? 'primary.outlinedBorder' : 'divider',
    borderRadius: {
      xs: 'lg',
      sm: 'md',
    },
    flexShrink: 0,
    whiteSpace: 'nowrap',
    fontWeight: 700,
    justifyContent: 'center',
    boxShadow: selected ? 'sm' : 'none',
  }),
}
