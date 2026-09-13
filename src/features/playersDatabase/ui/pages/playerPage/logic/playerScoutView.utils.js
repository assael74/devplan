// Shared formatting helpers for the player scout view model.

import { formatPerGameRate } from '../../../../model/shared/rate.model.js'

export const clean = value => String(
  value === null || value === undefined ? '' : value
).trim()

export const toNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const formatNumber = value => {
  const number = toNumber(value)

  if (number === null) return '-'
  if (Number.isInteger(number)) return String(number)

  return number.toFixed(2)
}

export const formatRate = value => formatPerGameRate(value)

export const formatPercent = value => {
  const number = toNumber(value)

  if (number === null) return '-'

  return `${Math.round(number * 100)}%`
}

export const formatMetricValue = (metric, value) => {
  if (metric === 'isYoungerAgeGroup' || metric === 'topClubOpportunityEligible') {
    return value ? 'כן' : 'לא'
  }

  if (
    metric === 'goalsShareOfTeam' ||
    metric === 'startsPct' ||
    metric === 'minutesPct' ||
    metric === 'scoringGamesPct'
  ) {
    return formatPercent(value)
  }

  if (metric === 'goalsPerGameDuration' || metric === 'minutesPerGame') {
    return formatRate(value)
  }

  return formatNumber(value)
}
