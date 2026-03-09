// domains/team/performance/TeamPerformanceDomainModal.sx.js
export const teamPerformanceModalSx = {
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

  kpiSheet: {
    p: 1,
    borderRadius: 'md',
  },

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
  },

  filtersSheet: {
    p: 1,
    borderRadius: 'md',
  },

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
    '&::-webkit-scrollbar': {
      width: 6,
      height: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,0.28)',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(0,0,0,0.38)',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  },

  table: {
    width: '100%',
    '& th, & td': { whiteSpace: 'nowrap' },
  },

  thInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
  },

  grid2: {
    display: 'grid',
    border: 1,
    gridTemplateColumns: '1fr 1fr 1fr',
  }
}

export const domainBoxSx = {
  sx: {
    px: 0.5,
    py: 0.4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    bgcolor: 'background.level1',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
}
