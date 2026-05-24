// clubProfile/desktop/modules/players/components/sections/ui/performanceSection.ui.js

import {
  getPlayerInsightProfile,
} from '../../../../../../../../../shared/players/insights/insights.profiles.js'

import {
  formatLtr,
} from '../../../../../../../../../shared/format/direction.js'

const emptyObject = {}

const noSampleProfile = {
  id: 'insufficient_sample',
  label: 'אין מדגם',
  shortLabel: 'אין מדגם',
  tone: 'neutral',
  icon: 'pending',
}

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const num = Number(value)

  return Number.isFinite(num) ? num : fallback
}

const formatNumber = (value, digits = 2) => {
  const num = toNumber(value)

  return num == null
    ? formatLtr('—')
    : formatLtr(num.toFixed(digits))
}

const formatSigned = (value, digits = 2) => {
  const num = toNumber(value)

  if (num == null) return formatLtr('—')

  const sign = num > 0 ? '+' : ''

  return formatLtr(`${sign}${num.toFixed(digits)}`)
}

const getSummary = performance => {
  return performance?.summary || performance?.scoring?.summary || emptyObject
}

const getMeta = performance => {
  return performance?.meta || performance?.scoring?.meta || emptyObject
}

const getDirectProfile = ({ row, performance }) => {
  return (
    performance?.profile ||
    performance?.insightProfile?.profile ||
    performance?.insightProfile?.insight ||
    performance?.playerInsight?.profile ||
    performance?.playerInsight?.insight ||
    row?.insightProfile?.profile ||
    row?.insightProfile ||
    row?.performanceProfile ||
    null
  )
}

const getProfileId = ({ row, performance }) => {
  return (
    performance?.insightId ||
    performance?.profileId ||
    performance?.insightProfile?.insightId ||
    performance?.insightProfile?.profileId ||
    performance?.playerInsight?.insightId ||
    performance?.playerInsight?.profileId ||
    row?.insightProfileId ||
    row?.profileId ||
    row?.scoringProfileId ||
    ''
  )
}

const getProfile = ({ row, performance }) => {
  const profile = getDirectProfile({
    row,
    performance,
  })

  if (profile?.id) return profile

  const profileId = getProfileId({
    row,
    performance,
  })

  if (!profileId) return noSampleProfile

  return getPlayerInsightProfile(profileId) || noSampleProfile
}

const getRating = summary => {
  return (
    summary?.ratingRaw ??
    summary?.rating ??
    summary?.avgRating ??
    null
  )
}

const getImpact = summary => {
  return (
    summary?.tva ??
    summary?.cumulativeImpact ??
    summary?.totalImpact ??
    null
  )
}

const getStats = ({ row, summary }) => {
  const stats = row?.playerFullStats || row?.playerGamesStats || {}

  return {
    goals: toNumber(
      summary?.goals ??
        stats?.goals ??
        row?.goals,
      0
    ),

    assists: toNumber(
      summary?.assists ??
        stats?.assists ??
        row?.assists,
      0
    ),

    minutesPctLabel:
      summary?.minutesPctLabel ||
      stats?.timeRateLabel ||
      stats?.minutesPctLabel ||
      row?.minutesPctLabel ||
      '0%',
  }
}

const getImpactColor = value => {
  const num = toNumber(value)

  if (num > 0) return 'success'
  if (num < 0) return 'warning'

  return 'neutral'
}

const getRatedGames = ({ summary, meta }) => {
  return (
    meta?.ratedGames ??
    meta?.scoresCount ??
    summary?.ratedGames ??
    summary?.scores ??
    0
  )
}

export const buildPerformanceSectionModel = ({
  row,
  performance,
} = {}) => {
  const summary = getSummary(performance)
  const meta = getMeta(performance)

  const rating = getRating(summary)
  const impact = getImpact(summary)

  return {
    ready: Boolean(performance),

    profile: getProfile({
      row,
      performance,
    }),

    ratingLabel: formatNumber(rating),
    impactLabel: formatSigned(impact),
    impactColor: getImpactColor(impact),

    stats: getStats({
      row,
      summary,
    }),

    meta: {
      ratedGames: getRatedGames({
        summary,
        meta,
      }),
    },
  }
}
