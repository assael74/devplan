// hub/components/lists/list.sx.js

export const listSx = {
  root: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: 'auto',
    overflow: 'visible',
    pb: isMobile ? 0 : 20,
  }),

  row: (selected) => ({
    px: 1,
    py: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    borderRadius: 12,
    cursor: 'pointer',
    bgcolor: selected ? 'background.level2' : 'transparent',
    border: '1px solid',
    borderColor: selected ? 'primary.outlinedBorder' : 'transparent',
    '&:hover': {
      bgcolor: 'background.level1'
    },
  }),

  subLine: {
    opacity: 0.75,
    mt: 0.25,
    lineHeight: 1.2,
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
    position: 'sticky',
    top: 0,
    zIndex: 5,
    p: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
  },

  barRow: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center'
  },

  countRow: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 0.5,
    gap: 1
  },

  chipsWrap: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    minWidth: 0
  },

  scroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto'
  },

  clearChip: (enabled) => ({
    cursor: enabled ? 'pointer' : 'default',
    px: 0.5,
    py: 0.2,
    minHeight: 24,
  }),
}
