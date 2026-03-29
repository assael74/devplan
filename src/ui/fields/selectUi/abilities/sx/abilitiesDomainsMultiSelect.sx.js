//  ui/fields/selectUi/abilities/sx/abilitiesDomainsMultiSelect.sx.js

export const abilitiesDomainsMultiSelectSx = {
  select: {
    minHeight: 42,
    borderRadius: 'md',
  },

  placeholder: {
    color: 'text.tertiary',
  },

  valueWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
    minHeight: 24,
  },

  chip: {
    borderRadius: '999px',
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
