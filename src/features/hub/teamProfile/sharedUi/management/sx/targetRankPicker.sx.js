// teamProfile/sharedUi/management/sx/targetRankPicker.sx.js

export const targetRankPickerSx = {
  root: {
    display: 'grid',
    gap: 0.75,
    minWidth: 0,
  },

  group: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    overflow: 'hidden',

    '& .MuiButton-root:first-of-type': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: 'var(--joy-radius-md)',
      borderBottomLeftRadius: 'var(--joy-radius-md)',
    },

    '& .MuiButton-root:last-of-type': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: 'var(--joy-radius-md)',
      borderBottomRightRadius: 'var(--joy-radius-md)',
    },
  },

  modeButton: {
    minHeight: 40,
    px: 0.8,
  },

  modeText: (selected) => ({
    display: 'grid',
    gap: 0.1,
    minWidth: 0,
    color: selected ? 'common.white' : 'text.primary',
  }),

  modeHelper: (selected) => ({
    color: 'inherit',
    opacity: selected ? 0.85 : 0.65,
  }),

  exactField: (isMobile) => ({
    width: isMobile ? '100%' : 180,
    maxWidth: '100%',
    minWidth: 0,
  }),

  rangeField: (isMobile) => ({
    width: isMobile ? '100%' : 280,
    maxWidth: '100%',
    minWidth: 0,
  }),
}
