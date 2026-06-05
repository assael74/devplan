// teamProfile/desktop/modules/players/performanceRows.model.js

import {
  buildPlayerRowTargets,
} from './row/index.js'

const emptyArray = []

const toNum = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const formatRating = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'

  return n.toFixed(2)
}

const formatSigned = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00'
  if (n > 0) return `+${n.toFixed(2)}`

  return n.toFixed(2)
}

const buildMinutesPct = item => {
  const minutes = toNum(item?.minutes, 0)
  const maxMinutes = toNum(item?.scopeMaxMinutes, 0)

  if (!maxMinutes) {
    return {
      minutesPct: null,
      minutesPctLabel: '',
    }
  }

  const pct = Math.round((minutes / maxMinutes) * 100)

  return {
    minutesPct: pct,
    minutesPctLabel: `${pct}%`,
  }
}

export const buildPerformanceByPlayerId = rows => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray

  return safeRows.reduce((acc, item) => {
    const playerId = asText(item?.playerId)
    if (!playerId) return acc

    const minutes = buildMinutesPct(item)

    acc[playerId] = {
      playerId,

      profileId: item?.insightId || item?.profile?.id || '',
      insightId: item?.insightId || item?.profile?.id || '',
      profile: item?.profile || item?.insight || null,

      rating: item?.ratingRaw ?? item?.rating ?? null,
      ratingRaw: item?.ratingRaw ?? null,
      ratingLabel: formatRating(item?.ratingRaw ?? item?.rating),

      tva: toNum(item?.tva, 0),
      tvaLabel: formatSigned(item?.tva),

      goals: toNum(item?.goals, 0),
      assists: toNum(item?.assists, 0),

      minutes: toNum(item?.minutes, 0),
      scopeMaxMinutes: toNum(item?.scopeMaxMinutes, 0),
      minutesPct: minutes.minutesPct,
      minutesPctLabel: minutes.minutesPctLabel,

      reliability: item?.reliability || null,
      reliabilityLabel: item?.reliabilityLabel || '',

      source: item,
    }

    return acc
  }, {})
}

export const mergeRowsWithPerformance = ({ rows, performanceRows, team } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray
  const byPlayerId = buildPerformanceByPlayerId(performanceRows)

  return safeRows.map(row => {
    const playerId = asText(row?.playerId || row?.id)
    const performance = byPlayerId[playerId] || null
    const stats = row?.playerGamesStats || {}

    const targets = buildPlayerRowTargets({
      row,
      team,
    })

    return {
      ...row,

      targets,

      performance: performance
        ? {
            ...performance,
            goals: performance.goals ?? toNum(stats.goals, 0),
            assists: performance.assists ?? toNum(stats.assists, 0),
            minutesPctLabel:
              performance.minutesPctLabel ||
              stats.minutesPctLabel ||
              '0%',
            squadLabel: stats.squadLabel || '',
            playedLabel: stats.playedLabel || '',
            startedLabel: stats.startedLabel || '',
          }
        : null,
    }
  })
}
