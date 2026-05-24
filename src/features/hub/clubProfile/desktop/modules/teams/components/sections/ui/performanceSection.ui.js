// clubProfile/desktop/modules/teams/components/sections/ui/performanceSection.ui.js

import {
  formatLtr,
} from '../../../../../../../../../shared/format/direction.js'

const emptyObject = {}

const toNumber = (value, fallback = null) => {
  const num = Number(value)

  return Number.isFinite(num) ? num : fallback
}

const formatNumber = (value, digits = 2) => {
  const num = toNumber(value)

  return num == null ? '—' : formatLtr(num.toFixed(digits))
}

const formatPercent = value => {
  const num = toNumber(value)

  return num == null ? '—' : formatLtr(`${num}%`)
}

const formatSigned = (value, digits = 2) => {
  const num = toNumber(value)

  if (num == null) return formatLtr('—')

  const sign = num > 0 ? '+' : ''

  return formatLtr(`${sign}${num.toFixed(digits)}`)
}

const getSummary = performance => {
  return performance?.summary || emptyObject
}

const getScoring = performance => {
  return performance?.scoring || emptyObject
}

const getCurrent = performance => {
  return getScoring(performance)?.current || emptyObject
}

const getGaps = performance => {
  return getScoring(performance)?.gaps || emptyObject
}

const getMeta = performance => {
  return performance?.meta || emptyObject
}

const getProfileLabel = performance => {
  const summary = getSummary(performance)

  if (summary?.fallbackType === 'league') {
    return 'ליגה'
  }

  return (
    performance?.profile?.shortLabel ||
    performance?.profile?.label ||
    performance?.insightProfile?.shortLabel ||
    performance?.insightProfile?.label ||
    'קבוצתי'
  )
}

const getProfileTone = performance => {
  const summary = getSummary(performance)

  if (summary?.fallbackType === 'league') {
    return 'neutral'
  }

  return (
    performance?.profile?.tone ||
    performance?.insightProfile?.tone ||
    'neutral'
  )
}

const getProfileIcon = performance => {
  const summary = getSummary(performance)

  if (summary?.fallbackType === 'league') {
    return 'league'
  }

  return (
    performance?.profile?.icon ||
    performance?.insightProfile?.icon ||
    'team'
  )
}

const getRatingLabel = performance => {
  const summary = getSummary(performance)
  const current = getCurrent(performance)

  const rating =
    summary?.ratingRaw ??
    summary?.rating ??
    summary?.avgRating ??
    summary?.teamRating ??
    summary?.efficiency ??
    null

  if (rating != null) {
    return formatNumber(rating)
  }

  if (current?.successRate != null) {
    return formatPercent(current.successRate)
  }

  if (summary?.pointsPerGame != null) {
    return formatNumber(summary.pointsPerGame)
  }

  return '—'
}

const getImpactValue = performance => {
  const summary = getSummary(performance)
  const gaps = getGaps(performance)

  return (
    summary?.tva ??
    summary?.cumulativeImpact ??
    summary?.totalImpact ??
    summary?.targetDelta ??
    summary?.pointsDelta ??
    gaps?.points ??
    gaps?.successRate ??
    null
  )
}

const getImpactColor = value => {
  const num = toNumber(value)

  if (num > 0) return 'success'
  if (num < 0) return 'warning'

  return 'neutral'
}

const getGamesCount = performance => {
  const summary = getSummary(performance)
  const meta = getMeta(performance)
  const current = getCurrent(performance)

  return (
    meta?.gamesCount ??
    summary?.ratedGames ??
    summary?.games ??
    summary?.scores ??
    current?.games ??
    current?.activeGames ??
    0
  )
}

const getMetaLabel = performance => {
  const current = getCurrent(performance)

  if (current?.points != null) {
    return `${current.points} נק׳`
  }

  return 'מדד קבוצתי'
}

export const buildTeamPerformanceSectionModel = ({
  performance,
} = {}) => {
  const impactValue = getImpactValue(performance)

  return {
    ready: Boolean(performance),

    profile: {
      label: getProfileLabel(performance),
      tone: getProfileTone(performance),
      icon: getProfileIcon(performance),
    },

    ratingLabel: getRatingLabel(performance),
    impactLabel: formatSigned(impactValue),
    impactColor: getImpactColor(impactValue),

    meta: {
      gamesCount: getGamesCount(performance),
      label: getMetaLabel(performance),
    },
  }
}
