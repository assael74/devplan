// src/features/playersDatabase/ui/components/scout/sx/scoutCompactTooltip.sx.js

export const scoutCompactTooltipSx = {
  root: {
    minWidth: 180,
    direction: 'rtl',
  },
  title: {
    mb: 0.5,
    fontWeight: 700,
  },
  meta: {
    mb: 0.5,
    color: 'neutral.400',
  },
  list: {
    display: 'grid',
    gap: 0.25,
  },
  item: {
    '&::before': {
      content: '"•"',
      mx: 0.5,
    },
  },
}
