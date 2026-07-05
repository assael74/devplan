// features/playersDatabase/components/summary/logic/summaryDetails.logic.js

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../../leagues/leagueUtils.js'
import {
  pdbLeagueTeamsCount,
} from '../../../sharedLogic/pdbCounts.logic.js'

const hasValue = value => value !== undefined && value !== null

export const getSummaryFallbackValue = (value, fallbackValue = '') => (
  hasValue(value) ? value : fallbackValue
)

export const getSummaryLeagueTeamsCount = league => {
  const teamsCount = pdbLeagueTeamsCount(league)
  return teamsCount || ''
}

export const getSummaryLeagueDetailsRows = league => {
  const leagueUrl = league?.leagueUrl || league?.source?.leagueUrl

  return [
    {
      id: 'leagueName',
      label: 'שם ליגה',
      value: league?.leagueName,
      type: 'value',
    },
    {
      id: 'ageGroupLabel',
      label: 'קבוצת גיל',
      value: league?.ageGroupLabel,
      type: 'value',
    },
    {
      id: 'teamsCount',
      label: 'קבוצות',
      value: getSummaryLeagueTeamsCount(league),
      type: 'value',
    },
    {
      id: 'level',
      label: 'רמה',
      value: getLeagueLevelLabel(league?.level),
      type: 'value',
    },
    {
      id: 'region',
      label: 'אזור',
      value: getLeagueRegionLabel(league?.region),
      type: 'value',
    },
    {
      id: 'leagueUrl',
      label: 'קישור ליגה',
      value: leagueUrl,
      type: 'link',
    },
  ]
}
