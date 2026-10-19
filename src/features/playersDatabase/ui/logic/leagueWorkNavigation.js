// src/features/playersDatabase/ui/logic/leagueWorkNavigation.js

import { PLAYERS_DATABASE_QUERY_KEYS as queryKeys } from './routeBuilders.js'
import { TEAM_STRONG_SIGNAL_MINIMUMS } from '../../domain/signals/teamSignalSummary.js'

export const LEAGUE_RESEARCH_FILTER_LABELS = {
  strongMin1: 'חזק אחד לפחות',
  strongMin2: 'שני חזקים לפחות',
  strongMin3: 'שלושה חזקים ומעלה',
  strongMin1Pending: 'ממתינות לחקירה — חזק אחד לפחות',
  strongMin2Pending: 'ממתינות לחקירה — שני חזקים לפחות',
  strongMin3Pending: 'ממתינות לחקירה — שלושה חזקים ומעלה',
  strong1: 'חזק 1',
  strong2: 'חזק 2',
  strong3Plus: 'חזק 3 ומעלה',
  strong1Marked: 'סומנו לחקירה — חזק 1',
  strong2Marked: 'סומנו לחקירה — חזק 2',
  strong3PlusMarked: 'סומנו לחקירה — חזק 3 ומעלה',
  pendingStrong: 'ממתינות — חזק',
  pendingWatch: 'ממתינות — מעקב',
  markedInvestigation: 'סומנו לחקירה',
  missingSignalInformation: 'מידע חסר',
}

export const LEAGUE_STRONG_SIGNAL_MINIMUM_OPTIONS = TEAM_STRONG_SIGNAL_MINIMUMS.map(value => ({
  value, label: value === 3 ? '3 ומעלה' : String(value),
}))

const researchFilters = [
  'strongSignals', 'watchSignals', 'unmarkedInvestigation',
  ...Object.keys(LEAGUE_RESEARCH_FILTER_LABELS),
]
export const LEAGUE_LOADING_FILTER_LABELS = {
  incompleteStats: 'ללא טעינת סטטיסטיקות מלאה',
}

const loadingFilters = ['missingStats', 'gamesGap', 'unknownGap', ...Object.keys(LEAGUE_LOADING_FILTER_LABELS)]

export const readLeagueWorkNavigation = searchParams => {
  const researchMode = searchParams.get(queryKeys.workMode) === 'research'
  const candidate = searchParams.get(queryKeys.workFilter)
  const filters = researchMode ? researchFilters : loadingFilters
  return { researchMode, filter: filters.includes(candidate) ? candidate : 'all' }
}

export const buildLeagueWorkSearchParams = ({ searchParams, researchMode, filter = 'all' }) => {
  const next = new URLSearchParams(searchParams)
  if (researchMode) next.set(queryKeys.workMode, 'research')
  else next.delete(queryKeys.workMode)
  if (filter === 'all') next.delete(queryKeys.workFilter)
  else next.set(queryKeys.workFilter, filter)
  return next
}
