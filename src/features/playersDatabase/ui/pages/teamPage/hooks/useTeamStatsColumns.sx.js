// features/playersDatabase/ui/pages/teamPage/hooks/useTeamStatsColumns.sx.js

export const teamStatsColumnsSx = {
  markedNumber: {
    fontWeight: 700,
  },

  playerUrlIcon: {
    minWidth: 26,
    minHeight: 26,
  },

  validNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  validName: {
    fontWeight: 600,
    textAlign: 'left',
    minWidth: 0,
  },

  matchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  matchSelect: {
    minWidth: 0,
    width: 150,
    maxWidth: 150,
    textAlign: 'left',

    '& button': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  identityColumn: {
    width: 126,
    minWidth: 126,
  },

  identityChip: {
    fontWeight: 600,
  },

  statusColumn: {
    width: 132,
    minWidth: 132,
  },

  statusText: {
    fontWeight: 600,
  },

  statusSelect: {
    minWidth: 0,
    width: 118,
    maxWidth: 118,

    '& button': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  scoutProfileColumn: {
    width: 250,
    minWidth: 250,
  },

  emptyProfile: {
    color: 'neutral.500',
  },

  profileWrap: {
    display: 'flex',
    minWidth: 0,
  },
}
