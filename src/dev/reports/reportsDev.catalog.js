// src/dev/reports/reportsDev.catalog.js

export const REPORT_DEV_CATEGORIES = {
  TARGETS: 'targets',
  INSIGHTS: 'insights',
  DETAILS: 'details',
}

export const REPORT_DEV_SCOPES = {
  PLAYER: 'player',
  TEAM: 'team',
  PLAYERS: 'players',
  TEAMS: 'teams',
}

export const REPORT_DEV_CATEGORY_OPTIONS = [
  {
    id: REPORT_DEV_CATEGORIES.TARGETS,
    label: 'דוחות יעדים אישיים',
    icon: 'targets',
  },
  {
    id: REPORT_DEV_CATEGORIES.INSIGHTS,
    label: 'דוחות תובנות',
    icon: 'insights',
  },
  {
    id: REPORT_DEV_CATEGORIES.DETAILS,
    label: 'דוחות מפרט',
    icon: 'details',
  },
]

export const REPORT_DEV_CATALOG = [
  {
    id: 'playerTargets',
    categoryId: REPORT_DEV_CATEGORIES.TARGETS,
    label: 'יעדי שחקן',
    scope: REPORT_DEV_SCOPES.PLAYER,
    scopeLabel: 'אישי',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: 'teamTargets',
    categoryId: REPORT_DEV_CATEGORIES.TARGETS,
    label: 'יעדי קבוצה',
    scope: REPORT_DEV_SCOPES.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: true,
    needsUpgrade: false,
  },
  {
    id: 'teamPerformance',
    categoryId: REPORT_DEV_CATEGORIES.TARGETS,
    label: 'ביצוע קבוצה',
    scope: REPORT_DEV_SCOPES.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: 'playerPerformance',
    categoryId: REPORT_DEV_CATEGORIES.TARGETS,
    label: 'ביצוע שחקן',
    scope: REPORT_DEV_SCOPES.PLAYER,
    scopeLabel: 'אישי',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: 'squadBuildingInsights',
    categoryId: REPORT_DEV_CATEGORIES.INSIGHTS,
    label: 'תובנות בניית סגל',
    scope: REPORT_DEV_SCOPES.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: 'teamPerformanceInsights',
    categoryId: REPORT_DEV_CATEGORIES.INSIGHTS,
    label: 'תובנות ביצוע קבוצה',
    scope: REPORT_DEV_SCOPES.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: 'playersPerformanceDetails',
    categoryId: REPORT_DEV_CATEGORIES.DETAILS,
    label: 'ביצועי שחקנים',
    scope: REPORT_DEV_SCOPES.PLAYERS,
    scopeLabel: 'מפרט שחקנים',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: 'teamsPerformanceDetails',
    categoryId: REPORT_DEV_CATEGORIES.DETAILS,
    label: 'ביצועי קבוצות',
    scope: REPORT_DEV_SCOPES.TEAMS,
    scopeLabel: 'מפרט קבוצות',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: 'teamSquadManagement',
    categoryId: REPORT_DEV_CATEGORIES.DETAILS,
    label: 'ניהול סגל קבוצתי',
    scope: REPORT_DEV_SCOPES.TEAM,
    scopeLabel: 'קבוצה',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: 'teamsSquadManagement',
    categoryId: REPORT_DEV_CATEGORIES.DETAILS,
    label: 'ניהול סגל קבוצות',
    scope: REPORT_DEV_SCOPES.TEAMS,
    scopeLabel: 'מספר קבוצות',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: 'squadDetails',
    categoryId: REPORT_DEV_CATEGORIES.DETAILS,
    label: 'מפרט סגל',
    scope: REPORT_DEV_SCOPES.TEAM,
    scopeLabel: 'קבוצתי',
    exists: true,
    connected: false,
    needsUpgrade: true,
  },
  {
    id: 'teamVideoDetails',
    categoryId: REPORT_DEV_CATEGORIES.DETAILS,
    label: 'מפרט וידאו קבוצתי',
    scope: REPORT_DEV_SCOPES.TEAM,
    scopeLabel: 'קבוצתי',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
  {
    id: 'playerVideoDetails',
    categoryId: REPORT_DEV_CATEGORIES.DETAILS,
    label: 'מפרט וידאו אישי',
    scope: REPORT_DEV_SCOPES.PLAYER,
    scopeLabel: 'אישי',
    exists: false,
    connected: false,
    needsUpgrade: false,
  },
]

export const getReportsByCategory = categoryId => {
  return REPORT_DEV_CATALOG.filter(report => report.categoryId === categoryId)
}

export const getConnectedReports = () => {
  return REPORT_DEV_CATALOG.filter(report => report.connected)
}

export const getReportCatalogItem = reportId => {
  return REPORT_DEV_CATALOG.find(report => report.id === reportId) || null
}

export const getReportStatus = report => {
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
