// src/features/calendar/components/WeekCalendarGrid.sx.js

export const GRID = {
  timeColW: 72,
  minWidth: 900,
  hourStart: 7,
  hourEnd: 24,
  pxPerMin: 1.15,
}

export const thinScrollbar = {
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
  '&::-webkit-scrollbar': { width: 4, height: 8 },
  '&::-webkit-scrollbar-thumb': { borderRadius: 999, backgroundColor: 'rgba(120,120,120,0.45)' },
  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
}

export const weekCalendarGridSx = {
  root: { height: '100%', minHeight: 0, overflow: 'hidden' },
  scroller: { height: '100%', minHeight: 0, overflow: 'auto', ...thinScrollbar },
  inner: { minWidth: GRID.minWidth },

  headerRow: {
    display: 'grid',
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'sticky',
    top: 0,
    zIndex: 20,
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
  },

  timeCol: {
    borderInlineEnd: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'sticky',
    insetInlineStart: 0,
    zIndex: 15,
  },

  timeCell: (h) => ({
    height: 60 * GRID.pxPerMin,
    px: 1,
    pt: 0.75,
  }),

  dayCol: (isWeekend, isLast, gridHeight) => ({
    position: 'relative',
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
    insetInlineStart: 8,
    insetInlineEnd: 8,
    top,
    height,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    p: 0.75,
    cursor: 'pointer',
    overflow: 'hidden',
  }),

  eventTitleRow: { display: 'flex', alignItems: 'center', gap: 0.75 },
  eventTitle: { lineHeight: 1.2 },
  eventMetaRow: { display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' },
}

export const buildGridCols = () => `${GRID.timeColW}px repeat(7, 1fr)`
