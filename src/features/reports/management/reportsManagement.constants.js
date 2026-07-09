// src/features/reports/management/ReportsManagement.constants.js

export const REPORTS_MANAGEMENT_REPORTS = {
  TEAM_TARGETS: 'teamTargets',
  PLAYER_TARGETS: 'playerTargets',
  SEASON_PLAN: 'seasonPlan',
  MINUTES_PLAN: 'minutesPlan',
}

export const REPORTS_MANAGEMENT_SCENARIOS = {
  FULL: 'full',
  ATTACK: 'attack',
  DEFENSE: 'defense',
  GOALKEEPER: 'goalkeeper',
  MISSING_AVATAR: 'missingAvatar',
  LONG_CONTENT: 'longContent',
  MISSING_VALUES: 'missingValues',
  MULTI_PAGE: 'multiPage',
  EMPTY_SECTIONS: 'emptySections',
  SMALL_SQUAD: 'smallSquad',
  LARGE_SQUAD: 'largeSquad',
  UNBALANCED_LAYERS: 'unbalancedLayers',
  MISSING_STATUSES: 'missingStatuses',
  MISSING_MINUTES_TARGETS: 'missingMinutesTargets',
  UNDEFINED_SQUAD_ROLES: 'undefinedSquadRoles',
  EMPTY_SQUAD: 'emptySquad',
}

const TEAM_TARGETS_SCENARIOS = [
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.FULL,
    label: 'דוח מלא',
    description: 'תרחיש תקין עם כל נתוני הקבוצה',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MISSING_AVATAR,
    label: 'ללא אווטאר',
    description: 'בדיקת fallback של זהות הקבוצה',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.LONG_CONTENT,
    label: 'תוכן ארוך',
    description: 'שמות וערכים ארוכים במיוחד',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MISSING_VALUES,
    label: 'ערכים חסרים',
    description: 'בדיקת ערכי fallback ונתונים חלקיים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MULTI_PAGE,
    label: 'מספר עמודים',
    description: 'בדיקת שבירות עמוד והדפסה',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.EMPTY_SECTIONS,
    label: 'מקטעים ריקים',
    description: 'בדיקת דוח כאשר חלק מהמקטעים אינם קיימים',
  },
]

const PLAYER_TARGETS_SCENARIOS = [
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.ATTACK,
    label: 'שחקן התקפה',
    description: 'חלוץ עם יעדי תפוקה התקפיים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.DEFENSE,
    label: 'שחקן הגנה',
    description: 'שחקן הגנה עם יעדי ספיגה ויעד שערים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.GOALKEEPER,
    label: 'שוער',
    description: 'שוער עם יעדי ספיגה ומשחקים ללא ספיגה',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MISSING_AVATAR,
    label: 'ללא תמונה',
    description: 'בדיקת תמונת ברירת המחדל של השחקן',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.LONG_CONTENT,
    label: 'תוכן ארוך',
    description: 'שם שחקן, קבוצה ומועדון ארוכים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MISSING_VALUES,
    label: 'ערכים חסרים',
    description: 'בדיקת דוח עם מידע מזהה חלקי',
  },
]

const SEASON_PLAN_SCENARIOS = [
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.FULL,
    label: 'סגל מלא',
    description: 'חלוקה מלאה של שחקנים, סטטוסים וחוליות',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.SMALL_SQUAD,
    label: 'סגל קטן',
    description: 'בדיקת דוח עם מספר מצומצם של שחקנים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.LARGE_SQUAD,
    label: 'סגל גדול',
    description: 'בדיקת טבלה ארוכה ושבירת עמודים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.UNBALANCED_LAYERS,
    label: 'חוסר איזון בחוליות',
    description: 'בדיקת חוסרים ועודפים בין קווי המשחק',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MISSING_STATUSES,
    label: 'סטטוסים חסרים',
    description: 'בדיקת שחקנים ללא החלטת תכנון מפורשת',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MISSING_VALUES,
    label: 'ערכים חסרים',
    description: 'בדיקת נתוני שחקנים וקבוצה חלקיים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.EMPTY_SQUAD,
    label: 'סגל ריק',
    description: 'בדיקת מצב ללא שחקנים להצגה',
  },
]

const MINUTES_PLAN_SCENARIOS = [
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.FULL,
    label: 'תכנון מלא',
    description: 'חלוקת מעמד, עמדות ויעדי דקות לכל הסגל',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.SMALL_SQUAD,
    label: 'סגל קטן',
    description: 'בדיקת דוח חלוקת דקות עם סגל מצומצם',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.LARGE_SQUAD,
    label: 'סגל גדול',
    description: 'בדיקת קבוצות דקות ארוכות ושבירת עמודים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MISSING_MINUTES_TARGETS,
    label: 'יעדי דקות חסרים',
    description: 'בדיקת שחקנים ללא מעמד שממנו נגזר יעד דקות',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.UNDEFINED_SQUAD_ROLES,
    label: 'מעמדי סגל לא מוגדרים',
    description: 'בדיקת ערכי מעמד שאינם קיימים באפשרויות המערכת',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.MISSING_VALUES,
    label: 'ערכים חסרים',
    description: 'בדיקת נתוני שחקנים וקבוצה חלקיים',
  },
  {
    id: REPORTS_MANAGEMENT_SCENARIOS.EMPTY_SQUAD,
    label: 'סגל ריק',
    description: 'בדיקת מצב ללא שחקנים להצגה',
  },
]

const REPORT_SCENARIOS = {
  [REPORTS_MANAGEMENT_REPORTS.TEAM_TARGETS]: TEAM_TARGETS_SCENARIOS,
  [REPORTS_MANAGEMENT_REPORTS.PLAYER_TARGETS]: PLAYER_TARGETS_SCENARIOS,
  [REPORTS_MANAGEMENT_REPORTS.SEASON_PLAN]: SEASON_PLAN_SCENARIOS,
  [REPORTS_MANAGEMENT_REPORTS.MINUTES_PLAN]: MINUTES_PLAN_SCENARIOS,
}

export const DEFAULT_REPORTS_MANAGEMENT_REPORT = REPORTS_MANAGEMENT_REPORTS.TEAM_TARGETS

export const getReportsManagementScenarioOptions = reportId => {
  return REPORT_SCENARIOS[reportId] || TEAM_TARGETS_SCENARIOS
}

export const getDefaultReportsManagementScenario = reportId => {
  return getReportsManagementScenarioOptions(reportId)[0]?.id || REPORTS_MANAGEMENT_SCENARIOS.FULL
}
