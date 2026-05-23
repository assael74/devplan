// teamProfile/desktop/modules/players/components/sections/ui/performanceCell.ui.js

import {
  getPlayerInsightProfile,
} from '../../../../../../../../../shared/players/insights/insights.profiles.js'

export const toNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export const getPerformance = row => {
  return row?.performance || {}
}

export const getPerformanceProfile = row => {
  const performance = getPerformance(row)

  if (performance?.profile?.id) {
    return performance.profile
  }

  return getPlayerInsightProfile(
    performance?.profileId ||
      performance?.insightId ||
      row?.insightProfileId ||
      row?.profileId ||
      row?.scoringProfileId ||
      row?.insightProfile?.id ||
      row?.performanceProfile?.id ||
      'secondary_contributor'
  )
}

export const getRatingLabel = row => {
  const performance = getPerformance(row)

  return (
    performance?.ratingLabel ||
    row?.ratingLabel ||
    row?.scoreLabel ||
    row?.efficiencyLabel ||
    row?.rating ||
    '-'
  )
}

export const getTvaValue = row => {
  const performance = getPerformance(row)

  return (
    performance?.tvaLabel ||
    row?.tvaLabel ||
    row?.tva ||
    row?.impactLabel ||
    row?.impact ||
    '0'
  )
}

export const getImpactColor = value => {
  const n = Number(String(value).replace('+', ''))

  if (n > 0) return 'success'
  if (n < 0) return 'warning'

  return 'neutral'
}

export const getPerformanceStats = row => {
  const performance = getPerformance(row)
  const stats = row?.playerGamesStats || {}

  return {
    goals: toNumber(
      performance?.goals ??
        stats.goals ??
        row?.goals
    ),

    assists: toNumber(
      performance?.assists ??
        stats.assists ??
        row?.assists
    ),

    minutesPctLabel:
      performance?.minutesPctLabel ||
      stats.minutesPctLabel ||
      row?.minutesPctLabel ||
      `${toNumber(stats.minutesPct ?? row?.minutesPct)}%`,

    startedLabel:
      stats.startedLabel ||
      row?.startedLabel ||
      '',
  }
}

export const buildPerformanceCellModel = row => {
  return {
    profile: getPerformanceProfile(row),
    ratingLabel: getRatingLabel(row),
    tvaValue: getTvaValue(row),
    stats: getPerformanceStats(row),
  }
}
