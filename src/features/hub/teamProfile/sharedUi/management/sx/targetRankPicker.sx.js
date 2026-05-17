// teamProfile/sharedUi/management/sx/targetRankPicker.sx.js

export const targetRankPickerSx = {
  root: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  group: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 12,
    overflow: 'hidden',

    '& .MuiButton-root:first-of-type': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },

    '& .MuiButton-root:last-of-type': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
  },

  modeText: (selected) => ({
    display: 'grid',
    gap: 0.15,
    minWidth: 0,
    color: selected ? 'common.white' : 'text.primary',
  }),

  modeHelper: (selected) => ({
    color: 'inherit',
    opacity: selected ? 0.85 : 0.65,
  }),

  exactField: (isMobile) => ({
    width: isMobile ? '100%' : 220,
    maxWidth: '100%',
    minWidth: 0,
  }),

  rangeField: (isMobile) => ({
    width: isMobile ? '100%' : 320,
    maxWidth: '100%',
    minWidth: 0,
  }),
}
