// teamProfile/modules/performance/components/performance.sx.js

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
