// features/insightsHub/performance/logic/teamTargetNumbers.logic.js

import {
  getTeamTargetProfiles,
} from '../../../../shared/teams/targets/index.js'

import {
  emptyText,
  formatRange,
  formatValue,
} from './performanceModel.format.js'

const tableOrder = {
  top: 1,
  midHigh: 2,
  midLow: 3,
  bottom: 4,
}

const sortProfiles = (profiles = []) => {
  return [...profiles].sort((a, b) => {
    return (tableOrder[a.id] || 99) - (tableOrder[b.id] || 99)
  })
}

const buildProfileRow = profile => {
  const forecast = profile?.targets?.forecast || {}

  return {
    id: profile.id,
    label: profile.label || emptyText,
    rank: profile.rankRange
      ? formatRange(profile.rankRange)
      : profile.rankLabel || emptyText,
    points: formatValue(forecast.points),
    pointsRate: formatValue(forecast.pointsRate, '%'),
    goalsFor: formatValue(forecast.goalsFor),
    goalsAgainst: formatValue(forecast.goalsAgainst),
    goalDifference: formatValue(forecast.goalDifference),
  }
}

const buildRows = () => {
  return sortProfiles(getTeamTargetProfiles()).map(buildProfileRow)
}

export const buildTeamTargetNumbersBlock = (block = {}) => {
  return {
    title: block.title || 'מספרי יעד לפי אזור טבלה',
    subtitle: block.subtitle || '',
    columns: [
      { id: 'label', label: 'אזור' },
      { id: 'rank', label: 'מיקום' },
      { id: 'points', label: 'נקודות' },
      { id: 'pointsRate', label: 'אחוז' },
      { id: 'goalsFor', label: 'זכות' },
      { id: 'goalsAgainst', label: 'חובה' },
      { id: 'goalDifference', label: 'הפרש' },
    ],
    rows: buildRows(),
  }
}
