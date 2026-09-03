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
    justifyContent: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  validName: {
    fontWeight: 600,
    textAlign: 'center',
    minWidth: 0,
  },

  matchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  invalidNameButton: {
    cursor: 'pointer',
    maxWidth: 150,
    minHeight: 'unset',
    '--Button-minHeight': 'unset',
    '--Button-paddingInline': 0,
    '--Button-radius': 0,
    backgroundColor: 'transparent',
    border: 0,
    borderRadius: 0,
    color: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    '&:hover, &[aria-expanded="true"]': {
      backgroundColor: 'transparent',
    },
  },

  nameMatchPopover: {
    width: 260,
    p: 1,
  },

  identityColumn: {},

  identityChip: {
    fontWeight: 600,
  },

  unidentifiedIdentityIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  newPlayerIdentityIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  identifiedIdentityIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  identityResolutionButton: {
    minHeight: 24,
    px: 0.65,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  identityResolutionPopover: {
    width: 250,
    p: 0.85,
  },

  identityResolutionName: {
    fontWeight: 700,
  },

  statusColumn: {},

  statusText: {
    fontSize: 11,
    fontWeight: 500,
  },

  statusSelect: {
    minWidth: 0,
    width: '100%',
    maxWidth: 'none',
    flex: 1,
    minHeight: 24,

    '& button': {
      minHeight: 24,
      px: 0.5,
      fontSize: 10,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  statusStack: {
    minWidth: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'success.500',
  },

  transferDirectionChip: {
    width: 28,
    minWidth: 28,
    height: 24,
    p: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    '& .MuiChip-label': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 0,
    },
  },

  scoutProfileColumn: {},

  emptyProfile: {
    color: 'neutral.500',
  },

  profileWrap: {
    display: 'flex',
    minWidth: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0.75,
  },

  profileCorrectionChip: {
    minHeight: 18,
    px: 0.6,
    fontSize: 9,
  },
}
