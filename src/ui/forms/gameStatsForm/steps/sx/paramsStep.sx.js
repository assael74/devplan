// src/ui/forms/gameStatsForm/steps/sx/paramsStep.sx.js

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

  parmGroups: {
    display: 'grid',
    gap: 1,
  },

  parmGroup: {
    display: 'grid',
    gap: 1,
    p: 1.25,
    borderRadius: 'md',
  },

  parmGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(160px, 1fr))',
      lg: 'repeat(4, minmax(160px, 1fr))',
    },
    gap: 0.75,
  },

  parmCardState: ({ selected }) => ({
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

  parmCardMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  parmIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: 'text.tertiary',
  },

  parmLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },

  parmCheckbox: {
    flex: '0 0 auto',
  },
}
