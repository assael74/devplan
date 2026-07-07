// features/playersDatabase/components/profilesPage/preview/logic/previewScoutProfiles.logic.js

import { mergeCountMaps } from '../../logic/utils.js'
import {
  getScoutProfileRows,
  getScoutProfileTooltipData,
} from '../../../../sharedLogic/pdbScoutProfiles.logic.js'

const createDescription = profileId => {
  const info = getScoutProfileTooltipData(profileId)
  const rules = Array.isArray(info.rules) ? info.rules : []

  return [info.context, ...rules.slice(0, 2)].filter(Boolean).join(' | ')
}

export const buildScoutProfileItems = ({ profileResult }) => {
  const selectedRows = Array.isArray(profileResult?.selectionMetrics?.selectedRows)
    ? profileResult.selectionMetrics.selectedRows
    : []
  const sourceCounts = mergeCountMaps(selectedRows.map(row => row?.profileCounts || {}))
  const rows = getScoutProfileRows(sourceCounts)

  return rows.map(item => ({
    id: item.profileId,
    label: item.label,
    value: item.count,
    iconId: item.idIcon,
    description: createDescription(item.profileId),
  }))
}
