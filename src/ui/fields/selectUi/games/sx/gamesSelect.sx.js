// ui/fields/selectUi/games/sx/gamesSelect.sx.js

export const gamesSelectSx = {
  control: {
    width: '100%',
  },

  label: {
    fontSize: 12,
  },

  selectButton: {
    minHeight: 42,
    alignItems: 'stretch',
  },

  listbox: {
    maxHeight: 360,
    overflow: 'auto',
    p: 0.5,
  },

  option: {
    p: 0,
    borderRadius: 'md',
    overflow: 'hidden',
  },

  placeholder: {
    opacity: 0.6,
  },

  rowRoot: (isDisabled = false) => ({
    px: 1,
    py: 1,
    display: 'grid',
    gap: 0.5,
    width: '100%',
    minWidth: 0,
    opacity: isDisabled ? 0.72 : 1,
  }),

  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  iconBox: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },

  teamText: {
    fontWeight: 700,
    minWidth: 0,
  },

  vsText: {
    opacity: 0.55,
    flexShrink: 0,
  },

  opponentText: {
    fontWeight: 700,
    color: 'primary.500',
    minWidth: 0,
    flex: 1,
  },

  existsChip: {
    flexShrink: 0,
  },

  rowBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    minWidth: 0,
    pl: 3,
  },

  valueRoot: {
    minWidth: 0,
    width: '100%',
    display: 'grid',
    gap: 0.25,
    py: 0.25,
  },

  valueTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  valueBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  subText: {
    opacity: 0.72,
  },
}
