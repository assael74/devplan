// src/ui/forms/gameStatsForm/steps/sx/playersStep.sx.js

const playerCard = {
  display: 'grid',
  gap: 0.75,
  p: 1,
  borderRadius: 'md',
}

export const playersStepSx = {
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

  placeholder: {
    display: 'grid',
    gap: 0.75,
    p: 1.25,
    borderRadius: 'md',
  },

  playersGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(180px, 1fr))',
      lg: 'repeat(4, minmax(180px, 1fr))',
    },
    gap: 1,
  },

  playerCardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  playerMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    pr: 3,
  },

  playerCardState: ({ selected, disabled }) => ({
    ...playerCard,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.52 : 1,
    bgcolor: selected ? 'primary.softBg' : 'background.surface',
    borderColor: selected ? 'primary.outlinedBorder' : 'divider',
    boxShadow: selected ? 'sm' : 'none',
    transition: 'background-color .14s ease, border-color .14s ease, box-shadow .14s ease, transform .14s ease',

    '&:hover': disabled
      ? {}
      : {
          borderColor: selected ? 'primary.outlinedBorder' : 'neutral.outlinedHoverBorder',
          bgcolor: selected ? 'primary.softBg' : 'background.level1',
          boxShadow: 'sm',
        },
  }),
}
