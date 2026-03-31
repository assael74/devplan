//  ui/fields/selectUi/abilities/sx/abilitiesMultiSelect.sx.js

export const abilitiesMultiSelectSx = {
  valueWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
    minHeight: 24,
  },

  listbox: {
    '--List-padding': '6px',
    '--ListItemDecorator-size': '28px',
    maxHeight: 320,
    overflow: 'auto',
  },

  optionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 1,
  },

  optionMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  optionLabel: {
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  checkIcon: {
    color: 'primary.500',
  },
}
