// src/features/reports/catalog/reports.catalog.js

import { REPORT_CATEGORY_IDS, REPORT_IDS, REPORT_SCOPE_IDS } from './reports.ids.js'

export const REPORT_CATEGORY_OPTIONS = [
  {
    id: REPORT_CATEGORY_IDS.TARGETS,
    label: 'דוחות יעדים',
    description: 'יעדים אישיים וקבוצתיים',
    idIcon: 'targets',
  },
  {
    id: REPORT_CATEGORY_IDS.INSIGHTS,
    label: 'דוחות תובנות',
    description: 'ניתוח, מסקנות והמלצות',
    idIcon: 'insights',
  },
  {
    id: REPORT_CATEGORY_IDS.DETAILS,
    label: 'דוחות מפרט',
    description: 'תמונת מצב מפורטת ללא שכבת תובנות',
    idIcon: 'details',
  },
  {
    id: REPORT_CATEGORY_IDS.EXTERNAL_DETAILS,
    label: 'מפרט חיצוני',
    description: 'דוחות מידע על שחקנים, קבוצות, ליגות ופרופילי סקאוט חיצוניים',
    idIcon: 'playersDatabase',
  },
]

export const REPORT_CATALOG = [
  {
    id: REPORT_IDS.PLAYER_TARGETS,
    categoryId: REPORT_CATEGORY_IDS.TARGETS,
    label: 'יעדי שחקן',
    scope: REPORT_SCOPE_IDS.PLAYER,
    scopeLabel: 'אישי',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.TEAM_TARGETS,
    categoryId: REPORT_CATEGORY_IDS.TARGETS,
    label: 'יעדי קבוצה',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.TEAM_PERFORMANCE,
    categoryId: REPORT_CATEGORY_IDS.TARGETS,
    label: 'ביצוע קבוצה',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: REPORT_IDS.PLAYER_PERFORMANCE,
    categoryId: REPORT_CATEGORY_IDS.TARGETS,
    label: 'ביצוע שחקן',
    scope: REPORT_SCOPE_IDS.PLAYER,
    scopeLabel: 'אישי',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.SQUAD_BUILDING_INSIGHTS,
    categoryId: REPORT_CATEGORY_IDS.INSIGHTS,
    label: 'תובנות בניית סגל',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: REPORT_IDS.TEAM_PERFORMANCE_INSIGHTS,
    categoryId: REPORT_CATEGORY_IDS.INSIGHTS,
    label: 'תובנות ביצוע קבוצה',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: REPORT_IDS.SEASON_PLAN,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'תכנון סגל',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'מפרט קבוצתי',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.MINUTES_PLAN,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'תכנון חלוקת דקות',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'מפרט קבוצתי',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.PLAYERS_PERFORMANCE_DETAILS,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'ביצועי שחקנים',
    scope: REPORT_SCOPE_IDS.PLAYERS,
    scopeLabel: 'מפרט שחקנים',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: REPORT_IDS.TEAMS_PERFORMANCE_DETAILS,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'ביצועי קבוצות',
    scope: REPORT_SCOPE_IDS.TEAMS,
    scopeLabel: 'מפרט קבוצות',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.TEAM_SQUAD_MANAGEMENT,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'ניהול סגל קבוצתי',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'קבוצה',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.TEAMS_SQUAD_MANAGEMENT,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'ניהול סגל קבוצות',
    scope: REPORT_SCOPE_IDS.TEAMS,
    scopeLabel: 'מספר קבוצות',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.SQUAD_DETAILS,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'מפרט סגל',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: REPORT_IDS.TEAM_VIDEO_DETAILS,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'מפרט וידאו קבוצתי',
    scope: REPORT_SCOPE_IDS.TEAM,
    scopeLabel: 'קבוצתי',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.PLAYER_VIDEO_DETAILS,
    categoryId: REPORT_CATEGORY_IDS.DETAILS,
    label: 'מפרט וידאו אישי',
    scope: REPORT_SCOPE_IDS.PLAYER,
    scopeLabel: 'אישי',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.EXTERNAL_LEAGUE_TABLE,
    categoryId: REPORT_CATEGORY_IDS.EXTERNAL_DETAILS,
    label: 'טבלת ליגה',
    scope: REPORT_SCOPE_IDS.LEAGUE_SEASON,
    scopeLabel: 'עונת ליגה',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.EXTERNAL_TEAM_DETAILS,
    categoryId: REPORT_CATEGORY_IDS.EXTERNAL_DETAILS,
    label: 'מפרט קבוצה',
    scope: REPORT_SCOPE_IDS.BIRTH_TEAM_SEASON,
    scopeLabel: 'קבוצה לעונה',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.EXTERNAL_PLAYER_DETAILS,
    categoryId: REPORT_CATEGORY_IDS.EXTERNAL_DETAILS,
    label: 'מפרט שחקן',
    scope: REPORT_SCOPE_IDS.EXTERNAL_PLAYER,
    scopeLabel: 'שחקן רב־עונתי',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.EXTERNAL_PLAYER_SEARCH_RESULTS,
    categoryId: REPORT_CATEGORY_IDS.EXTERNAL_DETAILS,
    label: 'תוצאות חיפוש שחקנים',
    scope: REPORT_SCOPE_IDS.PLAYER_SEARCH,
    scopeLabel: 'רשומות חיפוש',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: REPORT_IDS.DB_SEARCH,
    categoryId: REPORT_CATEGORY_IDS.EXTERNAL_DETAILS,
    label: 'מסלולי חיפוש קבוצות',
    scope: REPORT_SCOPE_IDS.TEAM_SEARCH,
    scopeLabel: 'תוצאות חיפוש קבוצות',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
]

export const REPORT_CATEGORY_META = REPORT_CATEGORY_OPTIONS.reduce((accumulator, category) => {
  accumulator[category.id] = {
    id: category.id,
    label: category.label,
    description: category.description,
    idIcon: category.idIcon,
  }

  return accumulator
}, {})

export function getReportsByCategory(categoryId) {
  return REPORT_CATALOG.filter(report => report.categoryId === categoryId)
}

export function getConnectedReports() {
  return REPORT_CATALOG.filter(report => report.connected)
}

export function getReportCatalogItem(reportId) {
  return REPORT_CATALOG.find(report => report.id === reportId) || null
}

export function getReportStatus(report) {
  if (!report?.exists) {
    return {
      id: 'notBuilt',
      label: 'לא נבנה',
      color: 'neutral',
    }
  }

  if (report.connected && report.needsUpgrade) {
    return {
      id: 'connectedUpgrade',
      label: 'מחובר · שדרוג',
      color: 'warning',
    }
  }

  if (report.connected) {
    return {
      id: 'connected',
      label: 'מחובר',
      color: 'success',
    }
  }

  if (report.needsUpgrade) {
    return {
      id: 'upgradeConnection',
      label: 'שדרוג וחיבור',
      color: 'warning',
    }
  }

  return {
    id: 'needsConnection',
    label: 'צריך חיבור',
    color: 'primary',
  }
}
