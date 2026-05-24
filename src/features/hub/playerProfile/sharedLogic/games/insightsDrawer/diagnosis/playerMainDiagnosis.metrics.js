// playerProfile/sharedLogic/games/insightsDrawer/diagnosis/playerMainDiagnosis.metrics.js

import {
  formatNumber,
  formatPercent,
  normalizeJoyColor,
} from '../cards/cards.shared.js'

import {
  formatLtr,
} from '../../../../../../../shared/format/index.js'

import {
  EMPTY,
  hasValue,
  toNum,
} from './playerMainDiagnosis.resolvers.js'

export const formatSigned = (value, digits = 2) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return EMPTY
  if (number > 0) return formatLtr(`+${formatNumber(number, digits)}`)
  if (number < 0) return formatLtr(formatNumber(number, digits))

  return formatLtr('0')
}

export const getRangeLabel = (range = []) => {
  if (!Array.isArray(range) || range.length < 2) return EMPTY

  const min = Number(range[0])
  const max = Number(range[1])

  if (!Number.isFinite(min) || !Number.isFinite(max)) return EMPTY

  return `${min}%–${max}%`
}

export const resolveRatingColor = value => {
  const rating = Number(value)

  if (!Number.isFinite(rating)) return 'neutral'
  if (rating >= 6.25) return 'success'
  if (rating >= 6) return 'primary'
  if (rating >= 5.85) return 'warning'

  return 'danger'
}

export const resolveImpactColor = value => {
  const impact = Number(value)

  if (!Number.isFinite(impact)) return 'neutral'
  if (impact > 0) return 'success'
  if (impact < 0) return 'danger'

  return 'neutral'
}

export const resolveMinutesColor = ({ minutesPct, targetRange }) => {
  const min = toNum(targetRange?.[0], null)
  const max = toNum(targetRange?.[1], null)
  const value = toNum(minutesPct, null)

  if (!Number.isFinite(value)) return 'neutral'
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 'neutral'

  if (value >= min && value <= max) return 'success'
  if (value < min * 0.7) return 'danger'
  if (value < min) return 'warning'

  return 'primary'
}

export const resolveStartsColor = startsPct => {
  const value = toNum(startsPct, 0)

  if (value >= 60) return 'success'
  if (value >= 30) return 'warning'
  if (value > 0) return 'neutral'

  return 'neutral'
}

export const buildMetric = ({
  id,
  label,
  value,
  sub,
  icon,
  color,
  tooltip = null,
}) => {
  return {
    id,
    label,
    value: hasValue(value) ? value : EMPTY,
    sub: sub || '',
    icon: icon || 'info',
    color: normalizeJoyColor(color),
    tooltip,
  }
}

export const buildMetrics = ({ usage, roleTarget, reliability, performance }) => {
  const minutesPct = toNum(usage?.minutesPct, 0)
  const minutesRange = roleTarget?.minutesRange
  const startsPct = toNum(usage?.startsPctFromTeamGames, 0)

  return [
    buildMetric({
      id: 'efficiencyRating',
      label: 'מדד יעילות',
      value: formatNumber(performance?.rating, 2),
      sub: 'ממוצע משחקים מדורגים',
      icon: 'scoringRating',
      color: resolveRatingColor(performance?.rating),
    }),
    buildMetric({
      id: 'tva',
      label: 'מדד השפעה',
      value: formatSigned(performance?.impact, 2),
      sub: 'השפעה מצטברת',
      icon: 'scoringImpact',
      color: resolveImpactColor(performance?.impact),
    }),
    buildMetric({
      id: 'minutesPct',
      label: 'דקות משחק',
      value: formatPercent(minutesPct),
      sub: `יעד ${getRangeLabel(minutesRange)}`,
      icon: 'time',
      color: resolveMinutesColor({
        minutesPct,
        targetRange: minutesRange,
      }),
    }),
    buildMetric({
      id: 'startsPct',
      label: 'פתח בהרכב',
      value: formatPercent(startsPct),
      sub: `${formatNumber(usage?.starts)} הרכב מתוך ${formatNumber(
        usage?.teamGamesTotal
      )}`,
      icon: 'lineup',
      color: resolveStartsColor(startsPct),
    }),
    buildMetric({
      id: 'gamesIncluded',
      label: 'חלק מהמשחק',
      value: `${formatNumber(usage?.gamesIncluded)}/${formatNumber(
        usage?.teamGamesTotal
      )}`,
      sub: 'משחקי ליגה',
      icon: 'game',
      color: 'neutral',
    }),
    buildMetric({
      id: 'reliability',
      label: 'מהימנות',
      value: reliability?.label || 'לא ידוע',
      sub: reliability?.caution ? 'יש לפרש בזהירות' : 'מדגם תקין',
      icon: reliability?.caution ? 'info' : 'verified',
      color: reliability?.tone || 'neutral',
    }),
  ]
}

export const buildSummaryFacts = ({ usage, performance }) => {
  const minutesPct = toNum(usage?.minutesPct, 0)

  return [
    {
      id: 'efficiencyRating',
      label: 'מדד יעילות',
      value: formatNumber(performance?.rating, 2),
      icon: 'scoringRating',
    },
    {
      id: 'tva',
      label: 'מדד השפעה',
      value: formatSigned(performance?.impact, 2),
      icon: 'scoringImpact',
    },
    {
      id: 'minutesPct',
      label: 'דקות משחק',
      value: formatPercent(minutesPct),
      icon: 'time',
    },
  ]
}

export const buildReliabilitySummary = ({ reliability }) => {
  return {
    id: reliability?.id || '',
    label: reliability?.label || 'לא ידוע',
    tone: normalizeJoyColor(reliability?.tone),
    icon: reliability?.caution ? 'info' : 'verified',
    caution: Boolean(reliability?.caution),
  }
}

export {
  formatNumber,
  normalizeJoyColor,
}
