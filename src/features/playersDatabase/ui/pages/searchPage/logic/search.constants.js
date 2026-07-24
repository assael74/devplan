// features/playersDatabase/ui/pages/searchPage/logic/search.constants.js

import {
  buildPlayerScoutProfileOptions,
  buildTeamScoutPriorityOptions,
} from '../../../logic/scoutDisplay.logic.js'

export const SEARCH_CONTEXT_TYPES = [
  { value: 'player', label: 'שחקן' },
  { value: 'team', label: 'קבוצה' },
]

export const SEARCH_PROFILE_MATCH_MODES = [
  { value: 'any', label: 'התאמה לפרופיל אחד לפחות' },
  { value: 'all', label: 'התאמה לכל הפרופילים' },
]

export const SEARCH_SCOUT_PROFILES = buildPlayerScoutProfileOptions()

export const SEARCH_TEAM_SCOUT_PRIORITIES = buildTeamScoutPriorityOptions()

export const SEARCH_STAT_FIELDS = [
  { value: 'goals', label: 'שערים' },
  { value: 'minutes', label: 'דקות' },
  { value: 'appearances', label: 'הופעות' },
  { value: 'starts', label: 'הרכב פותח' },
  { value: 'yellowCards', label: 'צהובים' },
  { value: 'subIns', label: 'נכנס כמחליף' },
  { value: 'subOuts', label: 'הוחלף' },
  { value: 'minutesPerGame', label: 'דקות להופעה' },
  { value: 'goalsPer90', label: 'שערים ל-90' },
]

export const SEARCH_OPERATORS = [
  { value: 'gte', label: 'לפחות' },
  { value: 'lte', label: 'לכל היותר' },
  { value: 'gt', label: 'גדול מ-' },
  { value: 'lt', label: 'קטן מ-' },
  { value: 'eq', label: 'שווה' },
]

export const createSearchCondition = id => ({
  id,
  field: 'minutes',
  operator: 'gte',
  value: '',
})

export const createSearchFilters = () => ({
  query: '',
  searchContext: '',
  seasons: [],
  birthYears: [],
  leagueLevels: [],
  leagues: [],
  scoutProfiles: [],
  teamScoutPriorities: [],
  profileMatchMode: 'any',
  conditions: [],
})
