// teamProfile/desktop/modules/players/performanceFilters.model.js

import {
  PLAYER_INSIGHT_PROFILES,
} from '../../../../../../shared/players/insights/insights.profiles.js'

const emptyArray = []

export const getPerformanceProfileId = row => {
  return (
    row?.performance?.profileId ||
    row?.performance?.insightId ||
    row?.performance?.profile?.id ||
    ''
  )
}

export const hasPlayerTargets = row => {
  return row?.targets?.hasTargets === true &&
    Array.isArray(row?.targets?.mainItems) &&
    row.targets.mainItems.length > 0
}

export const buildPerformanceProfileBuckets = rows => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray

  return Object.values(PLAYER_INSIGHT_PROFILES).map(item => ({
    id: item.id,
    value: item.id,
    label: item.shortLabel || item.label,
    idIcon: item.icon || 'insights',
    color: item.tone || 'neutral',
    count: safeRows.filter(row => getPerformanceProfileId(row) === item.id).length,
  }))
}

export const buildTargetsSummary = rows => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray
  const withoutTargets = safeRows.filter(row => !hasPlayerTargets(row)).length

  return {
    withoutTargets,
    withTargets: safeRows.length - withoutTargets,
  }
}

export const mergeSummaryWithPerformanceBuckets = ({
  summary,
  rows,
} = {}) => {
  return {
    ...(summary || {}),
    performanceProfileBuckets: buildPerformanceProfileBuckets(rows),
    targetsSummary: buildTargetsSummary(rows),
  }
}
