// src/features/hub/teamProfile/sharedLogic/players/print/performancePrint.model.js

import {
  PERFORMANCE_PRINT_COLUMNS,
} from './teamPlayersPrint.constants.js'
import {
  getPerformanceSortValue,
  mapPlayerPrintRows,
  nameCollator,
} from './teamPlayersPrint.shared.js'

function sortPerformanceRows(rows = []) {
  return [...rows].sort((a, b) => {
    const profileCompare =
      getPerformanceSortValue(a) - getPerformanceSortValue(b)

    if (profileCompare !== 0) return profileCompare

    return nameCollator.compare(
      a.playerFullName || a.fullName || '',
      b.playerFullName || b.fullName || ''
    )
  })
}

export function buildPerformancePrintModel(rows = []) {
  const sortedRows = sortPerformanceRows(rows)

  return {
    columns: PERFORMANCE_PRINT_COLUMNS,
    rows: mapPlayerPrintRows(sortedRows),
  }
}
