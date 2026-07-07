// features/playersDatabase/components/profilesPage/toolbar/scoutProfilesFilterRow.logic.js

import { getScoutProfileRows } from '../../../sharedLogic/pdbScoutProfiles.logic.js'
import { mergeCountMaps } from '../logic/utils.js'

export const getScoutProfilesSelectionRows = previewState => {
  const selectedRows = Array.isArray(previewState?.selectionMetrics?.selectedRows)
    ? previewState.selectionMetrics.selectedRows
    : []

  const selectionCounts = mergeCountMaps(
    selectedRows.map(row => row?.profileCounts || {})
  )

  return Object.keys(selectionCounts).length
    ? getScoutProfileRows(selectionCounts)
    : getScoutProfileRows({})
}
