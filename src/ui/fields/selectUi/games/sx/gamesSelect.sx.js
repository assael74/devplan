// ui/fields/selectUi/games/sx/gamesSelect.sx.js

export const gamesSelectSx = {
  selectButton: {
    minHeight: {
      xs: 48,
      sm: 42,
    },
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
    },
  },

  listbox: {
    maxHeight: 360,
    minWidth: 0,
    width: 'var(--Listbox-width)',
    maxWidth: '100%',
    overflowX: 'hidden',
  },

  option: {
    p: 0,
    borderRadius: 'md',
    overflow: 'hidden',
    minWidth: 0,
    maxWidth: '100%',
  },

  rowRoot: (isDisabled = false) => ({
    px: 0.75,
    py: {
      xs: 0.45,
      sm: 0.3,
    },
    display: 'grid',
    gap: {
      xs: 0.35,
      sm: 0.5,
    },
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    opacity: isDisabled ? 0.72 : 1,
  }),

  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    maxWidth: '100%',
  },

  rowMain: {
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 0.45,
      sm: 1,
    },
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
  },

  rowDesktopTopChips: {
    display: {
      xs: 'none',
      sm: 'flex',
    },
    alignItems: 'center',
    gap: 0.5,
    flexShrink: 0,
  },

  rowMobileDate: {
    display: {
      xs: 'block',
      sm: 'none',
    },
    flexShrink: 0,
    opacity: 0.72,
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },

  rowDesktopDate: {
    display: {
      xs: 'none',
      sm: 'block',
    },
    flexShrink: 0,
    opacity: 0.72,
    whiteSpace: 'nowrap',
  },

  rowBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 0.35,
      sm: 0.5,
    },
    flexWrap: {
      xs: 'nowrap',
      sm: 'wrap',
    },
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    pl: {
      xs: 0,
      sm: 3,
    },
  },

  rowMetaChip: {
    flexShrink: 0,
    maxWidth: {
      xs: 82,
      sm: 130,
    },

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  rowDesktopOnlyChip: {
    display: {
      xs: 'none',
      sm: 'inline-flex',
    },
    flexShrink: 0,
    maxWidth: 130,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  rowMobileChips: {
    display: {
      xs: 'flex',
      sm: 'none',
    },
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    overflow: 'hidden',
  },

  rowSelectionChips: {
    display: {
      xs: 'none',
      sm: 'flex',
    },
    alignItems: 'center',
    gap: 0.5,
    flexShrink: 0,
  },

  rowFixedChip: {
    flexShrink: 0,
    maxWidth: {
      xs: 86,
      sm: 130,
    },

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  iconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  teamText: {
    fontWeight: 700,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  opponentText: {
    fontWeight: 700,
    color: 'primary.500',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  placeholderText: {
    opacity: 0.6,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  valueRoot: {
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    display: 'grid',
    gap: 0.12,
    py: 0,
    overflow: 'hidden',
  },

  valueTop: {
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 0.45,
      sm: 0.75,
    },
    minWidth: 0,
    maxWidth: '100%',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },

  valueOpponentText: {
    minWidth: 0,
    color: 'primary.500',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  vsText: {
    flexShrink: 0,
    opacity: 0.72,
  },

  valueMobileDate: {
    display: {
      xs: 'block',
      sm: 'none',
    },
    flexShrink: 0,
    opacity: 0.72,
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },

  valueDesktopDate: {
    display: {
      xs: 'none',
      sm: 'block',
    },
    flexShrink: 0,
    opacity: 0.72,
    whiteSpace: 'nowrap',
  },

  valueBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: {
      xs: 1,
      sm: 0.75,
    },
    minWidth: 0,
    maxWidth: '100%',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },

  valueMetaChip: {
    flexShrink: 0,
    maxWidth: {
      xs: 110,
      sm: 120,
    },
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}
