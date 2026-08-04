// src/ui/forms/gameStats/steps/sx/paramsStep.sx.js

export const paramsStepSx = {
  stepContent: {
    display: 'grid',
    gap: 1,
    width: '100%',
  },

  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  presetsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  paramGroups: {
    display: 'grid',
    gap: 1,
  },

  paramGroup: {
    display: 'grid',
    gap: 1,
    p: 1.25,
    borderRadius: 'md',
  },

  paramGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(160px, 1fr))',
      lg: 'repeat(4, minmax(160px, 1fr))',
    },
    gap: 0.75,
  },

  paramCardState: ({ selected }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minHeight: 42,
    p: 0.85,
    borderRadius: 'md',
    cursor: 'pointer',
    bgcolor: selected ? 'primary.softBg' : 'background.surface',
    borderColor: selected ? 'primary.outlinedBorder' : 'divider',
    boxShadow: selected ? 'sm' : 'none',
    transition: 'background-color .14s ease, border-color .14s ease, box-shadow .14s ease',

    '&:hover': {
      bgcolor: selected ? 'primary.softBg' : 'background.level1',
      borderColor: selected ? 'primary.outlinedBorder' : 'neutral.outlinedHoverBorder',
      boxShadow: 'sm',
    },
  }),

  paramCardMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  paramIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: 'text.tertiary',
  },

  paramLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },

  paramCheckbox: {
    flex: '0 0 auto',
  },
}
