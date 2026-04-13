// ui/patterns/drawer/sx/header.sx.js

export const headerSx = {
  title: {
    fontWeight: 700,
    lineHeight: 1.05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  subline: {
    color: 'text.secondary',
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  boxMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
    minWidth: 0
  },

  meta: {
    color: 'text.secondary',
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  headerChip: (color) => ({
    flexShrink: 0,
    ...(color
      ? {
          color,
          bgcolor: `${color}18`,
        }
      : {}),
  }),
}
