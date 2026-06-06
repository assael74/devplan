// teamProfile/desktop/modules/players/components/print/ui/print.performanceRow.js

import {
  buildPerformanceCellModel,
} from '../../sections/ui/performanceCell.ui.js'

import {
  PLAYER_INSIGHT_PROFILES,
} from '../../../../../../../../../shared/players/insights/insights.profiles.js'

import {
  formatLtr,
} from '../../../../../../../../../shared/format/direction.js'

import {
  getMainPositionLabel,
  getRoleLabel,
  getTargetPrintItems,
} from './print.playerRow.js'

const performanceProfileOrder = Object.keys(PLAYER_INSIGHT_PROFILES)
const printNameCollator = new Intl.Collator('he', { sensitivity: 'base' })

const asText = value => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

const getPlayerName = row => {
  return row?.playerFullName || ''
}

export const getPerformanceProfileSortValue = row => {
  const model = buildPerformanceCellModel(row)
  const profileId = model.hasNumbers ? model.profile?.id : ''
  const index = performanceProfileOrder.indexOf(profileId)

  return index === -1 ? performanceProfileOrder.length : index
}

export const sortPerformancePrintRows = rows => {
  if (!Array.isArray(rows)) return []

  return [...rows].sort((a, b) => {
    const profileCompare =
      getPerformanceProfileSortValue(a) - getPerformanceProfileSortValue(b)

    if (profileCompare !== 0) return profileCompare

    return printNameCollator.compare(getPlayerName(a), getPlayerName(b))
  })
}

export const getPerformanceLabels = row => {
  const model = buildPerformanceCellModel(row)

  if (!model.hasNumbers) {
    return {
      profile: 'אין נתוני ביצוע',
      profileIcon: 'insights',
      profileTone: 'neutral',
      rating: '—',
      impact: '—',
      impactColor: 'neutral',
      goals: '—',
      assists: '—',
      minutes: '—',
    }
  }

  return {
    profile: model.profile?.shortLabel || model.profile?.label || '—',
    profileIcon: model.profile?.icon || 'insights',
    profileTone: model.profile?.tone || 'neutral',
    rating: model.ratingLabel || '—',
    impact: model.tvaValue || '—',
    impactColor: model.impactColor || 'neutral',
    goals: asText(model.stats?.goals),
    assists: asText(model.stats?.assists),
    minutes: asText(model.stats?.minutesPctLabel),
  }
}

export const getPerformanceSummaryLabel = performance => {
  return [
    performance.profile,
    `יעילות ${performance.rating}`,
    `השפעה ${performance.impact}`,
  ].filter(Boolean).join(' · ')
}

export const getPerformanceTopItems = performance => {
  return [
    {
      key: 'profile',
      label: performance.profile,
      icon: performance.profileIcon || 'insights',
      tone: performance.profileTone || 'neutral',
      iconOnly: true,
    },
    {
      key: 'rating',
      label: formatLtr(performance.rating),
      icon: 'scoringRating',
      tone: 'neutral',
    },
    {
      key: 'impact',
      label: formatLtr(performance.impact),
      icon: 'scoringImpact',
      tone: performance.impactColor || 'neutral',
    },
  ]
}

export const getPerformanceStatItems = performance => {
  return [
    { key: 'goals', icon: 'goal', metricKey: 'goals', value: performance.goals },
    { key: 'assists', icon: 'assists', metricKey: 'assists', value: performance.assists },
    { key: 'minutes', icon: 'playTimeRate', metricKey: 'minutes', value: performance.minutes },
  ]
}

export const getPerformancePrintRow = row => {
  const performance = getPerformanceLabels(row)
  const mainPosition = getMainPositionLabel(row)

  return {
    photo: row?.photo || '',
    name: row?.playerFullName || 'שם שחקן',
    subline: getRoleLabel(row),
    positions: mainPosition === 'ללא עמדה' ? [] : [mainPosition],
    targets: getTargetPrintItems(row),
    performance,
    performanceLabel: getPerformanceSummaryLabel(performance),
    performanceTopItems: getPerformanceTopItems(performance),
    stats: getPerformanceStatItems(performance),
  }
}
