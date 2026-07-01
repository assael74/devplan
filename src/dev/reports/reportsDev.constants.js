// src/dev/reports/reportsDev.constants.js

export const REPORTS_DEV_REPORTS = {
  TEAM_TARGETS: 'teamTargets',
  PLAYER_TARGETS: 'playerTargets',
}

export const REPORTS_DEV_SCENARIOS = {
  FULL: 'full',
  ATTACK: 'attack',
  DEFENSE: 'defense',
  GOALKEEPER: 'goalkeeper',
  MISSING_AVATAR: 'missingAvatar',
  LONG_CONTENT: 'longContent',
  MISSING_VALUES: 'missingValues',
  MULTI_PAGE: 'multiPage',
  EMPTY_SECTIONS: 'emptySections',
}

const TEAM_SCENARIO_OPTIONS = [
  {
    id: REPORTS_DEV_SCENARIOS.FULL,
    label: 'דוח מלא',
    description: 'תרחיש תקין עם כל נתוני הקבוצה',
  },
  {
    id: REPORTS_DEV_SCENARIOS.MISSING_AVATAR,
    label: 'ללא אווטאר',
    description: 'בדיקת fallback של זהות הקבוצה',
  },
  {
    id: REPORTS_DEV_SCENARIOS.LONG_CONTENT,
    label: 'תוכן ארוך',
    description: 'שמות וערכים ארוכים במיוחד',
  },
  {
    id: REPORTS_DEV_SCENARIOS.MISSING_VALUES,
    label: 'ערכים חסרים',
    description: 'בדיקת ערכי fallback ונתונים חלקיים',
  },
  {
    id: REPORTS_DEV_SCENARIOS.MULTI_PAGE,
    label: 'מספר עמודים',
    description: 'בדיקת שבירות עמוד והדפסה',
  },
  {
    id: REPORTS_DEV_SCENARIOS.EMPTY_SECTIONS,
    label: 'מקטעים ריקים',
    description: 'בדיקת דוח כאשר חלק מהמקטעים אינם קיימים',
  },
]

const PLAYER_SCENARIO_OPTIONS = [
  {
    id: REPORTS_DEV_SCENARIOS.ATTACK,
    label: 'שחקן התקפה',
    description: 'חלוץ עם יעדי תפוקה התקפיים',
  },
  {
    id: REPORTS_DEV_SCENARIOS.DEFENSE,
    label: 'שחקן הגנה',
    description: 'שחקן הגנה עם יעדי ספיגה ויעד שערים',
  },
  {
    id: REPORTS_DEV_SCENARIOS.GOALKEEPER,
    label: 'שוער',
    description: 'שוער עם יעדי ספיגה ומשחקים ללא ספיגה',
  },
  {
    id: REPORTS_DEV_SCENARIOS.MISSING_AVATAR,
    label: 'ללא תמונה',
    description: 'בדיקת תמונת ברירת המחדל של השחקן',
  },
  {
    id: REPORTS_DEV_SCENARIOS.LONG_CONTENT,
    label: 'תוכן ארוך',
    description: 'שם שחקן, קבוצה ומועדון ארוכים',
  },
  {
    id: REPORTS_DEV_SCENARIOS.MISSING_VALUES,
    label: 'ערכים חסרים',
    description: 'בדיקת דוח עם מידע מזהה חלקי',
  },
]

export const DEFAULT_REPORTS_DEV_REPORT = REPORTS_DEV_REPORTS.TEAM_TARGETS

export const getReportsDevScenarioOptions = reportId => {
  if (reportId === REPORTS_DEV_REPORTS.PLAYER_TARGETS) return PLAYER_SCENARIO_OPTIONS

  return TEAM_SCENARIO_OPTIONS
}

export const getDefaultReportsDevScenario = reportId => {
  if (reportId === REPORTS_DEV_REPORTS.PLAYER_TARGETS) {
    return REPORTS_DEV_SCENARIOS.ATTACK
  }

  return REPORTS_DEV_SCENARIOS.FULL
}
