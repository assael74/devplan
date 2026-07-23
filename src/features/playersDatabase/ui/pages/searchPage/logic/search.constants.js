// features/playersDatabase/ui/pages/searchPage/logic/search.constants.js

export const SEARCH_SEASON_MODES = [
  { value: 'single', label: 'עונה בודדת' },
  { value: 'cumulative', label: 'מצטבר בין עונות' },
  { value: 'everySeason', label: 'עמידה בכל עונה' },
  { value: 'trend', label: 'מגמה בין עונות' },
  { value: 'pastVsCurrent', label: 'עבר מול הווה' },
]

export const SEARCH_PROFILE_MATCH_MODES = [
  { value: 'any', label: 'התאמה לפרופיל אחד לפחות' },
  { value: 'all', label: 'התאמה לכל הפרופילים' },
]

export const SEARCH_SCOUT_PROFILES = [
  { value: 'clearScorer', label: 'כובש מובהק', description: 'נפח שערים גבוה ביחס לעונה' },
  { value: 'killerEfficiency', label: 'יעילות גבוהה', description: 'תפוקה גבוהה ביחס לדקות' },
  { value: 'lowMinutes', label: 'מקבל מעט דקות', description: 'פוטנציאל שאינו מקבל נפח משחק' },
  { value: 'frequentSub', label: 'מוחלף הרבה', description: 'פותח אך מתקשה להשלים משחקים' },
  { value: 'breakthrough', label: 'טרם פרץ', description: 'היסטוריה משמעותית מול ירידה נוכחית' },
  { value: 'combined', label: 'שילוב פרופילים', description: 'חפיפה בין כמה אינדיקציות' },
]

export const SEARCH_STAT_FIELDS = [
  { value: 'goals', label: 'שערים' },
  { value: 'minutes', label: 'דקות' },
  { value: 'appearances', label: 'הופעות' },
  { value: 'starts', label: 'הרכב פותח' },
  { value: 'subIns', label: 'נכנס כמחליף' },
  { value: 'subOuts', label: 'הוחלף' },
  { value: 'minutesPerGame', label: 'דקות להופעה' },
  { value: 'goalsPer90', label: 'שערים ל־90' },
]

export const SEARCH_OPERATORS = [
  { value: 'gte', label: 'לפחות' },
  { value: 'lte', label: 'לכל היותר' },
  { value: 'gt', label: 'גדול מ־' },
  { value: 'lt', label: 'קטן מ־' },
  { value: 'eq', label: 'שווה' },
]

export const SEARCH_IMPORT_TYPES = [
  { value: 'leagueTable', label: 'טבלת ליגה', description: 'דירוג, משחקים, שערים ונקודות' },
  { value: 'players', label: 'סגל שחקנים', description: 'שחקנים, מזהים וקישורים' },
  { value: 'stats', label: 'סטטיסטיקות שחקנים', description: 'דקות, הופעות, הרכב ושערים' },
  { value: 'history', label: 'נתונים היסטוריים', description: 'השלמת עונות קודמות' },
]

export const createSearchCondition = id => ({
  id,
  field: 'minutes',
  operator: 'gte',
  value: '',
})

export const createSearchFilters = () => ({
  query: '',
  seasonMode: 'single',
  seasons: [],
  birthYears: [],
  leagueLevels: [],
  leagues: [],
  scoutProfiles: [],
  profileMatchMode: 'any',
  conditions: [],
})
