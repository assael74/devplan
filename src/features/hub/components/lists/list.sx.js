// hub/components/lists/list.sx.js

export const listSx = {
  root: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
    pb: 0,
  }),

  row: (selected) => ({
    width: '100%',
    minWidth: 0,
    minHeight: 62,
    boxSizing: 'border-box',
    px: 1,
    py: 0.85,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    borderRadius: 12,
    cursor: 'pointer',
    bgcolor: selected ? 'background.level2' : 'transparent',
    border: '1px solid',
    borderColor: selected ? 'primary.outlinedBorder' : 'transparent',
    transition: 'background-color 140ms ease, border-color 140ms ease',
    '&:hover': {
      bgcolor: 'background.level1',
    },
    '&:hover .hub-row-action, &:focus-within .hub-row-action': {
      opacity: 1,
    },
  }),

  actionButton: (selected) => ({
    flexShrink: 0,
    opacity: selected ? 0.75 : 0.18,
    color: 'text.tertiary',
    transition: 'opacity 140ms ease, color 140ms ease',
    '&:hover': {
      color: 'text.primary',
    },
  }),

  subLine: {
    opacity: 0.72,
    mt: 0.3,
    lineHeight: 1.25,
    ml: 1,
  },

  colorDot: (bg) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    bgcolor: bg,
    boxShadow: '0 0 0 2px #fff',
    flexShrink: 0,
  }),

  bar: {
    flexShrink: 0,
    p: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
  },

  barRow: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
  },

  countRow: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 0.5,
    gap: 1,
  },

  chipsWrap: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    minWidth: 0,
  },

  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarGutter: 'stable',
  },

  clearChip: (enabled) => ({
    cursor: enabled ? 'pointer' : 'default',
    px: 0.5,
    py: 0.2,
    minHeight: 24,
  }),
}
