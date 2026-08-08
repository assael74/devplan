// features/playersDatabase/ui/pages/searchPage/logic/search.constants.js

import {
  buildPlayerScoutProfileOptions,
  buildTeamScoutPriorityOptions,
} from '../../../logic/scoutDisplay.logic.js'

export const SEARCH_CONTEXT_TYPES = [
  {
    value: 'player',
    label: 'שחקן',
  },
  {
    value: 'team',
    label: 'קבוצה',
  },
]

export const SEARCH_EXPECTED_LEVEL_CHANGE_OPTIONS = [
  {
    value: 'relegation',
    label: 'ירידה צפויה',
  },
  {
    value: 'unchanged',
    label: 'ללא שינוי',
  },
  {
    value: 'promotion',
    label: 'עלייה צפויה',
  },
  {
    value: 'unknown',
    label: 'לא ניתן לחשב',
  },
]

export const SEARCH_PROFILE_MATCH_MODES = [
  {
    value: 'any',
    label: 'התאמה לפרופיל אחד לפחות',
  },
  {
    value: 'all',
    label: 'התאמה לכל הפרופילים',
  },
]

export const SEARCH_SCOUT_PROFILES = buildPlayerScoutProfileOptions()
export const SEARCH_TEAM_SCOUT_PRIORITIES = buildTeamScoutPriorityOptions()

export const SEARCH_TEAM_INTERPRETATION_LEVELS = [
  {
    value: 'elite',
    label: 'יעד מוביל',
    tone: 'elite',
    summary: 'עדיפות מרבית לבדיקה',
    description: 'ציון עדיפות סקאוטינג גבוה במיוחד שמציב את הקבוצה כיעד מוביל לבדיקה.',
  },
  {
    value: 'high',
    label: 'עדיפות גבוהה',
    tone: 'high',
    summary: 'עדיפות גבוהה לבדיקה',
    description: 'ציון עדיפות סקאוטינג גבוה שמצדיק בדיקה מוקדמת של הקבוצה והשחקנים.',
  },
  {
    value: 'positive',
    label: 'חיובי',
    tone: 'positive',
    summary: 'מעל נקודת הייחוס',
    description: 'תוצאה חיובית מעל נקודת הייחוס של המודל.',
  },
  {
    value: 'neutral',
    label: 'רגיל',
    tone: 'neutral',
    summary: 'בטווח הרגיל',
    description: 'תוצאה בטווח הרגיל שאינה מייצרת עדיפות מיוחדת.',
  },
  {
    value: 'low',
    label: 'עדיפות נמוכה',
    tone: 'low',
    summary: 'מתחת לנקודת הייחוס',
    description: 'תוצאה נמוכה מנקודת הייחוס ולכן העדיפות לבדיקה נמוכה.',
  },
]

export const SEARCH_TEAM_PERFORMANCE_HELP = {
  attackPriority: 'רמת העדיפות ההתקפית מחברת בין קצב הכיבוש, העמידה ביעד והמיקום היחסי של הקבוצה בליגה.',
  defensePriority: 'רמת העדיפות ההגנתית מחברת בין קצב הספיגה, העמידה ביעד והמיקום היחסי של הקבוצה בליגה.',
  attackCombinedRate: 'הביצוע המשולב ההתקפי משקלל את ביצועי הכיבוש בפועל יחד עם הדירוג ההתקפי היחסי בליגה. ערך גבוה עשוי להצביע על סביבת התקפה חריגה.',
  defenseCombinedRate: 'הביצוע המשולב ההגנתי משקלל את ביצועי הספיגה בפועל יחד עם הדירוג ההגנתי היחסי בליגה. ערך גבוה עשוי להצביע על סביבת הגנה חריגה.',
  attackPerformance: 'מדד ביצועי ההתקפה של הקבוצה ביחס ליעד הצפוי ולסביבת הליגה.',
  defensePerformance: 'מדד ביצועי ההגנה של הקבוצה ביחס ליעד הצפוי ולסביבת הליגה.',
  tableRank: 'המיקום הנוכחי של הקבוצה בטבלת הליגה.',
  tableAttackRank: 'מיקום הקבוצה ביחס לקבוצות הליגה במדדי ההתקפה.',
  tableDefenseRank: 'מיקום הקבוצה ביחס לקבוצות הליגה במדדי ההגנה.',
  goalsFor: 'מספר שערי הזכות בפועל, או הצפי המנורמל לסיום כאשר העונה פעילה.',
  goalsAgainst: 'מספר שערי החובה בפועל, או הצפי המנורמל לסיום כאשר העונה פעילה.',
  teamGamePlayed: 'מספר משחקי הקבוצה בפועל, או הצפי המנורמל כאשר העונה פעילה.',
  playersCount: 'מספר השחקנים שנמצאים בסגל הקבוצה במסמך העונה.',
}

export const SEARCH_PLAYER_STAT_FIELDS = [
  {
    value: 'goals',
    label: 'שערים',
  },
  {
    value: 'appearances',
    label: 'משחקים',
  },
  {
    value: 'minutes',
    label: 'דקות',
  },
]

export const SEARCH_TEAM_STAT_FIELDS = [
  {
    value: 'goalsFor',
    label: 'שערי זכות',
  },
  {
    value: 'goalsAgainst',
    label: 'שערי חובה',
  },
  {
    value: 'teamGamePlayed',
    label: 'משחקים',
  },
  {
    value: 'tableRank',
    label: 'מיקום בטבלה',
  },
]

export const SEARCH_STAT_FIELDS = [
  ...SEARCH_PLAYER_STAT_FIELDS,
  ...SEARCH_TEAM_STAT_FIELDS.filter(teamField => (
    !SEARCH_PLAYER_STAT_FIELDS.some(playerField => playerField.value === teamField.value)
  )),
]

export const SEARCH_OPERATORS = [
  {
    value: 'gte',
    label: 'לפחות',
  },
  {
    value: 'lte',
    label: 'לכל היותר',
  },
  {
    value: 'gt',
    label: 'גדול מ-',
  },
  {
    value: 'lt',
    label: 'קטן מ-',
  },
  {
    value: 'eq',
    label: 'שווה',
  },
]

export const createSearchCondition = id => ({
  id,
  field: 'minutes',
  operator: 'gte',
  value: '',
})

export const createSearchFilters = () => ({
  searchContext: '',
  favoritesOnly: false,
  expectedLeagueLevelChanges: [],
  seasons: [],
  birthYears: [],
  leagueLevels: [],
  leagues: [],
  scoutProfiles: [],
  scoutCombinations: [],
  teamAttackPriorityLevels: [],
  teamDefensePriorityLevels: [],
  profileMatchMode: 'any',
  conditions: [],
})
