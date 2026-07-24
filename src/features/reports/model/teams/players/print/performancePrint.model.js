// src/features/hub/teamProfile/sharedLogic/players/print/performancePrint.model.js

import {
  PERFORMANCE_PRINT_COLUMNS,
} from './teamPlayersPrint.constants.js'

import {
  getPerformanceSortValue,
  mapPerformancePrintRows,
  nameCollator,
} from './teamPlayersPrint.shared.js'

function sortPerformanceRows(rows = []) {
  return [...rows].sort((first, second) => {
    const profileCompare =
      getPerformanceSortValue(first) -
      getPerformanceSortValue(second)

    if (profileCompare !== 0) return profileCompare

    return nameCollator.compare(
      first.playerFullName || first.fullName || first.name || '',
      second.playerFullName || second.fullName || second.name || ''
    )
  })
}

export function buildPerformancePrintModel(rows = []) {
  const sortedRows = sortPerformanceRows(rows)

  return {
    columns: PERFORMANCE_PRINT_COLUMNS,
    rows: mapPerformancePrintRows(sortedRows),
  }
}
