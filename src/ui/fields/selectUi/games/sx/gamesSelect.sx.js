// ui/fields/selectUi/games/sx/gamesSelect.sx.js

export const gamesSelectSx = {
  selectButton: {
    minHeight: 42,
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
    py: 0.75,
    display: 'grid',
    gap: 0.5,
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
    gap: 1,
    minWidth: 0,
    flex: 1,
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

  rowBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
    maxWidth: '100%',
    pl: 3,
  },

  valueRoot: {
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    display: 'grid',
    gap: 0.25,
    py: 0.25,
    overflow: 'hidden',
  },

  valueTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },

  valueBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
}
