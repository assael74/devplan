// teamProfile/modules/performance/components/performance.sx.js

export const modalSx = {
  wrap: {
    minWidth: 0,
    width: '100%',
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr',
    gap: 1.25,
    overflow: 'hidden',
  },

  kpiSheet: { p: 1, borderRadius: 'md' },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: 1,
  },

  kpiLeft: {
    display: 'flex',
    gap: 0.75,
    flexWrap: 'wrap',
    alignItems: 'center',
    minWidth: 0,
  },

  kpiRight: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 0.75,
    alignItems: 'center',
  },

  filtersSheet: { p: 1, borderRadius: 'md' },

  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  tableSheet: {
    borderRadius: 'sm',
    overflowY: 'auto',
    overflowX: 'auto',
    height: '100%',
    minHeight: 0,
    scrollbarGutter: 'stable',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': { width: 6, height: 6 },
    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.28)' },
    '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(0,0,0,0.38)' },
    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  },

  tableBase: {
    width: '100%',
    '& th, & td': { whiteSpace: 'nowrap' },
  },

  thInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
  },
}

// ✅ build table sx with RTL sticky offsets computed from widths
export const buildTableSx = ({ wAvatar = 56, wName = 160, wPos = 96, minWidth = 1100 } = {}) => {
  const r0 = 0
  const r1 = wAvatar
  const r2 = wAvatar + wName

  return {
    ...teamPerformanceModalSx.tableBase,
    minWidth,
    '& th:nth-of-type(1), & td:nth-of-type(1)': {
      position: 'sticky',
      right: r0,
      zIndex: 3,
      background: 'background.body',
      width: wAvatar,
      minWidth: wAvatar,
      maxWidth: wAvatar,
      textAlign: 'center',
    },
    '& th:nth-of-type(2), & td:nth-of-type(2)': {
      position: 'sticky',
      right: r1,
      zIndex: 2,
      background: 'background.body',
      width: wName,
      minWidth: wName,
      maxWidth: wName,
    },
    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      position: 'sticky',
      right: r2,
      zIndex: 1,
      background: 'background.body',
      width: wPos,
      minWidth: wPos,
      maxWidth: wPos,
    },
  }
}
