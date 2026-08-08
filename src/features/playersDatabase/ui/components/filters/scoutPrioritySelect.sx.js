// features/playersDatabase/ui/components/filters/scoutPrioritySelect.sx.js

export const scoutPrioritySelectSx = {
  optionContent: ({ colors, fontSize }) => ({
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    color: colors.text,
    fontSize,
  }),

  optionIcon: ({ colors, fontSize }) => ({
    flexShrink: 0,
    color: colors.main,
    fontSize: fontSize + 2,
  }),

  optionLabel: ({ colors, fontSize }) => ({
    minWidth: 0,
    color: colors.text,
    fontSize,
    fontWeight: 700,
    lineHeight: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),

  root: {
    minWidth: 0,
    display: 'grid',
    gap: 0.45,
  },

  label: fontSize => ({
    color: '#2F86C7',
    fontSize,
    fontWeight: 700,
  }),

  select: fontSize => ({
    minWidth: 0,
    width: '100%',
    minHeight: 34,
    bgcolor: '#fff',
    borderColor: '#b9d8ef',
    fontSize,

    '& .MuiSelect-indicator': {
      display: 'none',
    },

    '& .MuiSelect-button': {
      minWidth: 0,
      pr: 0,
    },
  }),

  option: fontSize => ({
    fontSize,

    '&.Mui-selected': {
      fontWeight: 700,
    },
  }),
}
