// features/playersDatabase/ui/components/scout/sx/scoutCompactTooltip.sx.js

export const scoutCompactTooltipSx = {
  root: {
    minWidth: 190,
    display: 'grid',
    gap: 0.4,
    textAlign: 'left',
  },

  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'left',
  },

  meta: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    opacity: 0.9,
    textAlign: 'left',
  },

  list: {
    display: 'grid',
    gap: 0.45,
    textAlign: 'left',
  },

  item: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.45,
    textAlign: 'left',

    '&::before': {
      content: '"•"',
      mx: 0.5,
    },
  },
}
