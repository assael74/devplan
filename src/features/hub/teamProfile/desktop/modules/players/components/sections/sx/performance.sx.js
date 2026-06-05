// teamProfile/desktop/modules/players/sections/sx/performance.sx.js

const CELL_ROW_H = 22

export const performanceSx = {
  root: {
    minWidth: 0,
    height: '100%',
    display: 'grid',
    gridTemplateRows: `${CELL_ROW_H}px ${CELL_ROW_H}px`,
    alignContent: 'center',
    gap: 0.35,
    px: 1,
    py: 0.35,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    boxShadow: 'inset 0 0 0 1px var(--joy-palette-divider)',
    overflow: 'hidden',
  },

  top: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    minHeight: CELL_ROW_H,
    maxHeight: CELL_ROW_H,
    overflow: 'hidden',
  },

  profileChip: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 150,
    minHeight: CELL_ROW_H,
    maxHeight: CELL_ROW_H,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  scoreChip: {
    flexShrink: 0,
    minWidth: 42,
    minHeight: CELL_ROW_H,
    maxHeight: CELL_ROW_H,
    justifyContent: 'center',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  impactChip: {
    flexShrink: 0,
    minWidth: 46,
    minHeight: CELL_ROW_H,
    maxHeight: CELL_ROW_H,
    justifyContent: 'center',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    minWidth: 0,
    minHeight: CELL_ROW_H,
    maxHeight: CELL_ROW_H,
    overflow: 'hidden',
    color: 'text.tertiary',
    fontSize: 11,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  empty: {
    minWidth: 0,
    height: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'md',
    bgcolor: 'background.level1',
    color: 'text.tertiary',
    fontSize: 12,
    fontWeight: 600,
  },
}
