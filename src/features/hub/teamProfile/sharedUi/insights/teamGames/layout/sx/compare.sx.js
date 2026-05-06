export const compareSx = {
  root: {
    display: 'grid',
    gap: 0.35,
    px: 0.25,
    mb: 0.75,
  },

  row: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    flexWrap: 'wrap',
  },

  sourceChip: {
    fontWeight: 700,
    '--Chip-minHeight': '22px',
    '--Chip-paddingInline': '8px',
    fontSize: 11,
  },

  item: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
    color: 'text.secondary',
    fontSize: 12,
    lineHeight: 1.3,
  },

  label: {
    color: 'text.tertiary',
    fontSize: 11,
    lineHeight: 1.3,
    fontWeight: 600,
  },

  value: (mismatch) => ({
    color: mismatch ? 'warning.500' : 'text.primary',
    fontSize: 12,
    lineHeight: 1.3,
    fontWeight: 700,
  }),

  dot: {
    color: 'text.tertiary',
    fontSize: 11,
    lineHeight: 1,
  },
}
