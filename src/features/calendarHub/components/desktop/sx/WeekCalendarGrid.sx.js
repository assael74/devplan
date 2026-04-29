// src/features/calendar/sx/WeekCalendarGrid.sx.js

export const GRID = {
  timeColW: 64,
  hourStart: 7,
  hourEnd: 24,
  pxPerMin: 1.05,
}

export const thinScrollbar = {
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
  '&::-webkit-scrollbar': { width: 4, height: 8 },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 999,
    backgroundColor: 'rgba(120,120,120,0.45)',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
}

export const weekCalendarGridSx = {
  root: {
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    width: '100%',
  },

  scroller: {
    height: '100%',
    minHeight: 0,
    overflow: 'auto',
    ...thinScrollbar,
  },

  inner: {
    width: '100%',
    minWidth: 0,
  },

  headerRow: {
    display: 'grid',
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    width: '100%',
  },

  headerCorner: {
    p: 1,
    borderInlineEnd: '1px solid',
    borderColor: 'divider',
    position: 'sticky',
    insetInlineStart: 0,
    zIndex: 30,
    bgcolor: 'background.surface',
  },

  headerDayCell: (isWeekend, isLast) => ({
    p: 1,
    minWidth: 0,
    overflow: 'hidden',
    borderInlineEnd: isLast ? 'none' : '1px solid',
    borderColor: 'divider',
    bgcolor: isWeekend ? 'background.level1' : 'background.surface',
    position: 'relative',
  }),

  weekendBadge: {
    position: 'absolute',
    top: 6,
    insetInlineEnd: 8,
    pointerEvents: 'none',
  },

  bodyGrid: {
    display: 'grid',
    width: '100%',
  },

  timeCol: {
    borderInlineEnd: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'sticky',
    insetInlineStart: 0,
    zIndex: 15,
  },

  timeCell: () => ({
    height: 60 * GRID.pxPerMin,
    px: 0.75,
    pt: 0.75,
  }),

  dayCol: (isWeekend, isLast, gridHeight) => ({
    position: 'relative',
    minWidth: 0,
    borderInlineEnd: isLast ? 'none' : '1px solid',
    borderColor: 'divider',
    bgcolor: isWeekend ? 'background.level1' : 'background.surface',
    minHeight: gridHeight,
  }),

  hourLine: (top) => ({
    position: 'absolute',
    top,
    left: 0,
    right: 0,
    borderTop: '1px solid',
    borderColor: 'divider',
    opacity: 0.55,
    pointerEvents: 'none',
  }),

  weekendSeparator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    insetInlineStart: 0,
    width: 3,
    bgcolor: 'divider',
    opacity: 0.85,
    pointerEvents: 'none',
  },

  eventCard: (top, height) => ({
    position: 'absolute',
    insetInlineStart: 4,
    insetInlineEnd: 4,
    top,
    height,
    borderRadius: 10,
    border: '1px solid',
    borderColor: 'divider',
    p: 0.5,
    cursor: 'pointer',
    overflow: 'hidden',
    minWidth: 0,
  }),

  eventTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  eventTitle: {
    lineHeight: 1.2,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  eventMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    mt: 0.35,
    flexWrap: 'wrap',
    minWidth: 0,
    overflow: 'hidden',
  },
}

export const buildGridCols = (daysCount = 7) =>
  `${GRID.timeColW}px repeat(${daysCount}, minmax(0, 1fr))`
