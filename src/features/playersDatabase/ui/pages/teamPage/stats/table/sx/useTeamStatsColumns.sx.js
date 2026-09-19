// features/playersDatabase/ui/pages/teamPage/stats/table/sx/useTeamStatsColumns.sx.js

export const teamStatsColumnsSx = {
  tableHeaderIcon: {
    display: 'inline-flex',
    alignItems: 'center',
  },

  markedNumber: {
    fontWeight: 700,
  },

  playerUrlIcon: {
    minWidth: 26,
    minHeight: 26,
  },

  validNameRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
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

  playerNameColumn: {
    textAlign: 'left !important',

    '& > div': {
      justifyContent: 'flex-start',
      textAlign: 'left',
    },
  },

  identityChip: {
    fontWeight: 600,
  },

  unidentifiedIdentityIcon: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  newPlayerIdentityIcon: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  identifiedIdentityIcon: {
    display: 'flex',
    width: '100%',
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
    width: 62,
    maxWidth: 62,
    flex: '0 0 62px',
    minHeight: 24,

    '& button': {
      minHeight: 24,
      px: 0.35,
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

  statusMovementControls: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
  },

  statusMovementTeamSelect: {
    minWidth: 0,
    flex: 1,
    '--Input-minHeight': '26px',
    '--Input-paddingInline': '0.35rem',

    '& input, & button': {
      fontSize: 10,
      px: 0.35,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  statusMovementSlotSelect: {
    width: 42,
    minWidth: 42,
    '--Select-minHeight': '26px',

    '& button': {
      px: 0.35,
      fontSize: 10,
      whiteSpace: 'nowrap',
    },
  },

  statusIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'success.500',
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
