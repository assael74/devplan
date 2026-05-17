// teamProfile/sharedUi/insights/teamPlayers/components/sx/components.sx.js

// teamProfile/sharedUi/insights/teamPlayers/components/sx/components.sx.js

export const componentsSx = {
  chips: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  summaryChip: {
    minWidth: 200,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 'md',
    px: 1,
    py: 1,
    '& .MuiChip-label': {
      minWidth: 0,
      width: '100%',
    },
  },

  chipContent: {
    display: 'grid',
    gap: 0.15,
    minWidth: 0,
    textAlign: 'right',
  },

  chipTitle: {
    fontWeight: 700,
    lineHeight: 1.1,
  },

  chipSub: {
    color: 'text.tertiary',
    lineHeight: 1.15,
    textAlign: 'left',
  },
}
